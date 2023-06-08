require("dotenv").config();

export type Environment = "development" | "production";
export const environment: Environment =
    (process.env.APP_ENV as Environment) || "development";

// default colors
export const colors = {
    background: "#032b43",
    primary: "#048ad8",
    secondary: "#199e8c",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196f3",
    success: "#4caf50",
};

export const submissionKeyString = "submissionKey-";

const access = {
    auth: {
        inviteSecret: process.env.AUTH_INVITE_SECRET || "",
        secret: process.env.AUTH_LOGIN_SECRET || "",
        anonymousSecret: process.env.AUTH_ANONYMOUS_SECRET || "",
        inviteTokenLifetime: (() => {
            switch (environment) {
                case "development":
                    return "1 day";
                default:
                    return "60 days";
            }
        })(),
        authTokenLifetime: "15 days",
        magicLinkLifetime: "5 minutes",
        anonymousLinkLifeTime: "60 days",
    },
    sendgrid: {
        key: process.env.SENDGRID_API_KEY || "",
        templates: {
            // Create templates in Sendgrid and add the template id here
            login: {},
            changeEmailRequest: {},
            changeEmailVerification: {},
            addedToOrganizationNotification: {},
            courseInvite: {},
        },
    },
    mongodb: {
        connectionUri: process.env.DB_CONNECTION_STRING || "",
    },
    storage: {
        bucket: (() => {
            const buckets = {
                development: process.env.DEVELOPMENT_STORAGE_BUCKET || "",
                production: process.env.PRODUCTION_STORAGE_BUCKET || "",
            };
            switch (process.env.OVERRIDE_DB || environment) {
                case "development":
                    return buckets.development;
                default:
                    return buckets.production;
            }
        })(),
    },
    surfconext: {
        issuer: process.env.SURF_OIDC_HEAD || "",
        client_id: process.env.SURF_CLIENT_ID || "",
        client_secret: process.env.SURF_CLIENT_SECRET || "",
    },
    google: {
        projectId: process.env.GOOGLE_PROJECT_ID || "",
        cloudFunctions: {
            computeAnalyticsBlock: (() => {
                switch (process.env.OVERRIDE_DB || environment) {
                    case "development":
                        return `http://localhost:3030`;
                    default:
                        return (
                            process.env
                                .GOOGLE_CLOUD_FUNCTIONS_COMPUTE_ANALYTICS_BLOCK ||
                            ""
                        );
                }
            })(),
        },
        clientEmail: process.env.GOOGLE_STORAGE_CLIENT_EMAIL || "",
        privateKey: (process.env.GOOGLE_STORAGE_PRIVATE_KEY || "")
            .split(String.raw`\n`)
            .join("\n"),
    },
    cloudCheck: {
        server: (() => {
            switch (process.env.OVERRIDE_DB || environment) {
                case "development":
                    return `http://localhost:2700`;
                default:
                    return process.env.CLOUDCHECK_SERVER_URL || "";
            }
        })(),
    },
    database: {
        mysql: {
            client: "mysql",
            connection: {
                host: `${process.env.CLOUDCHECK_MYSQL_HOST || ""}`,
                user: `${process.env.CLOUDCHECK_MYSQL_USER || ""}`,
                password: `${process.env.CLOUDCHECK_MYSQL_PASSWORD || ""}`,
                charset: "utf8",
                multipleStatements: true,
            },
        },
        postgresql: {
            client: "pg",
            connection: {
                host: `${process.env.CLOUDCHECK_POSTGRESQL_HOST || ""}`,
                user: `${process.env.CLOUDCHECK_POSTGRESQL_USER || ""}`,
                password: `${process.env.CLOUDCHECK_POSTGRESQL_PASSWORD || ""}`,
                charset: "utf8",
                database: "postgres",
                multipleStatements: true,
            },
        },
    },
};

const envConfigs = {
    development: {
        backend: `http://localhost:2500`,
        domain: `localhost`,
    },
    production: {
        backend: process.env.BACKEND_SERVER_URL || "",
        domain: process.env.DOMAIN || "",
    },
};

export const config = {
    fileSizeLimits: {
        default: 20 * 1024 * 1024, // bytes
        image: 5 * 1024 * 1024, // bytes
        audio: 20 * 1024 * 1024, // bytes
    },
    googleApiKey: process.env.GOOGLE_API_KEY,
    ...envConfigs[environment],
    ...access,
};
