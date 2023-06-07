require("dotenv").config();
// require("dotenv").config({
//     path: ".env.staging",
// });

export type Environment =
    | "development"
    | "devserver"
    | "staging"
    | "production";
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
                case "devserver":
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
            login: {
                en: "d-4b08ed624e5f474180e323c345e8db89",
                nl: "d-8ddf6a778f1a4b0688e1a9d5ea276d93",
            },
            changeEmailRequest: {
                en: "d-cf22177ded7642b394e0975e0d085869",
                nl: "d-7f7c5bd3a1e341f1b06e06aeb24d4698",
            },
            changeEmailVerification: {
                en: "d-8f2535f9b6d74c7abea28b36d6df4803",
                nl: "d-65bcf585a8b1401f856495267b2a0533",
            },
            addedToOrganizationNotification: {
                en: "d-8039f290bef241ad84a7e996c1596909",
                nl: "d-999ade3d78174f4290370bd6738e4fd1",
            },
            courseInvite: {
                en: "d-3ff2b69d3a7d469298de3dea957b024d",
                nl: "d-2f838bb59c1244fb9bfc6aa62eba700e",
            },
        },
    },
    mongodb: {
        connectionUri: process.env.DB_CONNECTION_STRING || "",
    },
    storage: {
        bucket: (() => {
            const buckets = {
                development: "upload.quarterfall.dev",
                staging: "upload.quarterfall-staging.dev",
                production: "upload.quarterfall.com",
            };
            switch (process.env.OVERRIDE_DB || environment) {
                case "development":
                case "devserver":
                    return buckets.development;
                case "staging":
                    return buckets.staging;
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
        projectId: "quarterfall",
        cloudFunctions: {
            computeAnalyticsBlock: (() => {
                switch (process.env.OVERRIDE_DB || environment) {
                    case "development":
                        return `http://analytics.quarterfall.local:3030`;
                    case "devserver":
                        return "https://europe-west1-quarterfall.cloudfunctions.net/computeAnalyticsBlock-develop";
                    case "staging":
                        return "https://europe-west1-quarterfall.cloudfunctions.net/computeAnalyticsBlock-staging";
                    default:
                        return "https://europe-west1-quarterfall.cloudfunctions.net/computeAnalyticsBlock-production";
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
                    return `http://cloudcheck.quarterfall.local:2700`;
                case "devserver":
                    return "http://cloudcheck.devserver.svc.cluster.local";
                case "staging":
                    return "http://cloudcheck.staging.svc.cluster.local";
                default:
                    return "http://cloudcheck.production.svc.cluster.local";
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
        backend: `http://api.quarterfall.local:2500`,
        domain: `quarterfall.local`,
        site: "https://www.quarterfall.dev",
    },
    devserver: {
        backend: `https://api.quarterfall.dev`,
        domain: `quarterfall.dev`,
        site: "https://www.quarterfall.dev",
    },
    staging: {
        backend: `https://api.quarterfall-staging.dev`,
        domain: `quarterfall-staging.dev`,
        site: "https://www.quarterfall.dev",
    },
    production: {
        backend: `https://api.quarterfall.com`,
        domain: `quarterfall.com`,
        site: "https://www.quarterfall.com",
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
