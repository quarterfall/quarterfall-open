import colors from "colors";
import { environment } from "config";

export enum LogLevel {
    Emerg = "emerg",
    Alert = "alert",
    Crit = "crit",
    Error = "error",
    Warning = "warning",
    Notice = "notice",
    Info = "info",
    Debug = "debug",
}

export interface ILogger {
    emerg: (message: string, meta?: any) => void;
    alert: (message: string, meta?: any) => void;
    crit: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
    warning: (message: string, meta?: any) => void;
    notice: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
    level: string;
}

export function createLogger(
    service: string,
    source: string,
    level = LogLevel.Info
): ILogger {
    const format = (message: string) => {
        if (environment === "development") {
            // "system: notice: Server listening on port 80"
            return `${colors.blue(source)}/${colors.yellow(level)}: ${message}`;
        } else {
            return `${source}/${level}: ${message}`;
        }
    };

    const writeToConsole = (level: string, message: string, meta?: any) => {
        if (meta) {
            console[level](format(message), meta);
        } else {
            console[level](format(message));
        }
    };

    return {
        emerg: (message: string, meta?: any) =>
            writeToConsole("error", message, meta),
        alert: (message: string, meta?: any) =>
            writeToConsole("error", message, meta),
        crit: (message: string, meta?: any) =>
            writeToConsole("error", message, meta),
        error: (message: string, meta?: any) =>
            writeToConsole("error", message, meta),
        warning: (message: string, meta?: any) =>
            writeToConsole("warn", message, meta),
        notice: (message: string, meta?: any) =>
            writeToConsole("log", message, meta),
        info: (message: string, meta?: any) =>
            writeToConsole("info", message, meta),
        debug: (message: string, meta?: any) =>
            writeToConsole("debug", message, meta),
        level,
    };
}

// Determine log level per environment
const logLevel = ((): LogLevel => {
    switch (environment) {
        case "production":
            return LogLevel.Debug;
        default:
            return LogLevel.Debug;
    }
})();

// Generate loggers

export const log = createLogger(environment, "api", logLevel);
