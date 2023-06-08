export type Environment = "development" | "production";

export const environment: Environment =
    ((process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV) as Environment) ||
    "development";

const envConfigs = {
    development: {
        backend:
            process.env.NEXT_PUBLIC_BACKEND_SERVER_URL ||
            "http://localhost:2500",
    },
    production: {
        backend: process.env.NEXT_PUBLIC_BACKEND_SERVER_URL || "",
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
