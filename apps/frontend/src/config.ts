export type Environment =
    | "development"
    | "devserver"
    | "staging"
    | "production";

export const environment: Environment =
    ((process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV) as Environment) ||
    "development";

const envConfigs = {
    development: {
        backend: `http://api.quarterfall.local:2500`,
        site: "https://www.quarterfall.dev",
    },
    devserver: {
        backend: `https://api.quarterfall.dev`,
        site: "https://www.quarterfall.dev",
    },
    staging: {
        backend: `https://api.quarterfall-staging.dev`,
        site: "https://www.quarterfall.dev",
    },
    production: {
        backend: `https://api.quarterfall.com`,
        site: "https://www.quarterfall.com",
    },
};

// default colors
export const colors = {
    appBar: "#17215C",
    primary: "#1C9EFF",
    secondary: "#FF520D",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196f3",
    success: "#4caf50",
    paperLight: "#fff",
    paperDark: "#0A1929",
};

export const config = {
    version: "2.6.1",
    googleApiKey: process.env.GOOGLE_API_KEY,
    ...envConfigs[environment],
};
