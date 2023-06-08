import { magicLoginStrategy } from "auth/strategies/MagicLinkStrategy";
import { setupSurfconextStrategy } from "auth/strategies/SurfconextStrategy";
import { config, environment } from "config";
import cors from "cors";
import session from "express-session";
import { graphqlUploadExpress } from "graphql-upload";
import { setupGraphQL } from "graphql/bootstrap";
import helmet from "helmet";
import passport from "passport";
import authRouter from "routes/auth";
import { setupNewsletterSubscribe } from "routes/newsletterSubscribe";
import { setupSendMessage } from "routes/sendMessage";
import { log } from "./Logger";
import mongoose = require("mongoose");
import express = require("express");
const app: express.Express = express();

import cookieParser = require("cookie-parser");
import colors = require("colors");
import sendgridMail = require("@sendgrid/client");
import humanInterval = require("human-interval");
import MongoStore = require("connect-mongo");

mongoose.set("strictQuery", false);

function setupAuthenticationHeaders() {
    // authentication and security middleware
    app.disable("x-powered-by");
    app.use(
        helmet({
            contentSecurityPolicy:
                environment === "production" ? undefined : false,
        })
    );
    app.use(
        cors({
            origin: (origin: string, callback) => {
                if (
                    environment === "development" ||
                    !origin ||
                    origin.endsWith(config.domain)
                ) {
                    callback(null, true);
                } else {
                    callback(
                        new Error(
                            `CORS access error from origin ${origin}. Only requests from domain ${config.domain} are allowed.`
                        )
                    );
                }
            },
            credentials: true,
        })
    );
    app.use(async (request, response, next) => {
        // add permissions policy header
        response.header(
            "Permissions-Policy",
            "geolocation=(), camera=(), microphone=(), fullscreen=()"
        );

        next();
    });
}

function setupHealthCheck() {
    app.get("/", (request, response, next) => {
        response.status(200).send();
    });
}

function setupErrorHandling() {
    app.use((err, request, response, next) => {
        log.error(err.toString());
        response.status(500);
        response.send(err);
    });
}

function setupSendgrid() {
    sendgridMail.setApiKey(config.sendgrid.key);
}

(async function bootstrap() {
    log.notice(`Starting server (${colors.magenta(environment)}).`);

    // initialize Mongoose
    log.notice("Connecting to the database.");

    await mongoose.connect(config.mongodb.connectionUri || "", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // json
    app.use(express.json());

    app.use(graphqlUploadExpress({ maxFileSize: 40000000, maxFiles: 10 }));

    // cookies
    app.use(cookieParser());
    app.set("trust proxy", 1);

    setupAuthenticationHeaders();

    const sessionConfig: session.SessionOptions = {
        secret: config.auth.secret,
        resave: false,
        saveUninitialized: false,
        proxy: environment !== "development",
        name: `auth_${environment}`,
        cookie: {
            maxAge: humanInterval(config.auth.authTokenLifetime),
            domain: config.domain,
            sameSite: false, // This should be false, as the strict option prevents the cookie with the authenticate info from being returned to the server.
            httpOnly: true,
            secure: environment !== "development",
        },
        store: MongoStore.create({
            mongoUrl: config.mongodb.connectionUri,
            collectionName: "sessions",
        }),
        unset: "destroy",
    };

    // On unset, the session is removed from MongoDB store
    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user: any, done) {
        if (!user) {
            done("Couldn't serialize user, user doesn't exist");
        }
        done(null, user);
    });

    passport.deserializeUser(function (user: any, done) {
        done(null, user);
    });

    passport.use("surfconext", await setupSurfconextStrategy());
    passport.use(magicLoginStrategy);

    // GraphQL
    await setupGraphQL(app);

    // health check
    setupHealthCheck();

    // Sendgrid
    setupSendgrid();

    // Teams events and newsletter subscription endpoint
    setupNewsletterSubscribe(app);

    // Send message from website endpoint
    setupSendMessage(app);

    // setup error handling
    setupErrorHandling();

    app.use("/", authRouter);

    // start the server
    const port = Number(process.env.PORT);
    const server = app.listen(port, () => {
        log.notice(`Backend server listening on port ${port}.`);
    });

    const gracefulShutdown = () => {
        server.close(() => {
            log.notice("Backend server closed.");
            // boolean means [force], see in mongoose doc
            mongoose.connection.close(false, () => {
                log.notice("Database connection closed.");
                process.exit(0);
            });
        });
    };

    // graceful shutdown of http server and db connection
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
})();
