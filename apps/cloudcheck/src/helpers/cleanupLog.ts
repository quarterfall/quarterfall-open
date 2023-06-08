import lodash = require("lodash");

export function cleanupLog(log: string[]): string[] {
    // make sure everything in the log is a string
    const cleanedLog = log.map((l) => {
        if (l === undefined) {
            return "undefined";
        } else if (l === null) {
            return "null";
        } else {
            return lodash.toString(l);
        }
    });
    return cleanedLog;
}
