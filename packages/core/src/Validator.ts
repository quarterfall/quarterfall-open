import checkEquality from "validator/lib/equals";
import checkEmail from "validator/lib/isEmail";
import checkEmpty from "validator/lib/isEmpty";
import checkFloat from "validator/lib/isFloat";
import checkInt from "validator/lib/isInt";
import checkJSON from "validator/lib/isJSON";
import checkLength from "validator/lib/isLength";
import checkUrl from "validator/lib/isURL";
import checkMatch from "validator/lib/matches";
import { Url } from "./Url";

export const patterns = {
    email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
    youtube: /^(https?:\/\/)?(www\.)?youtu(be|\.be)?(\.com)?\/.+/i,
    github: /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/i,
    time: /^[0-2]?\d:[0-5]\d(:[0-5]\d)?$/i,
    variable: /^[a-z][a-z_0-9]*$/i,
};

export const isFloat = (value: string): boolean => {
    // remove trailing comma/point
    if (value[value.length - 1] === "," || value[value.length - 1] === ".") {
        value = value.substring(0, value.length - 1);
    }
    return checkFloat(value || "");
};

export const isJSON = (value: string): boolean => {
    return checkJSON(value || "");
};

export const isURL = (value: string): boolean => {
    return checkUrl(value || "");
};

export const isEmail = (value: string): boolean => {
    return checkEmail(value || "");
};

export const isEmpty = (value: string): boolean => {
    return checkEmpty(value || "");
};

export const required = (value: string): boolean => {
    return !checkEmpty(value || "");
};

export const isVariable = (value: string): boolean => {
    return checkMatch(value || "", patterns.variable);
};

export const isYouTubeLink = (value: string): boolean => {
    return checkMatch(value || "", patterns.youtube);
};

export const isYouTubeEmbedLink = (value: string): boolean => {
    const m = checkMatch(value || "", patterns.youtube);
    const url = new Url(value || "");
    return (
        m &&
        (url.host === "youtu.be" ||
            ((url.path === "watch" || url.path === "playlist") &&
                (url.queryHasKey("v") || url.queryHasKey("list"))))
    );
};

export const isGitUrl = (value: string): boolean => {
    return checkMatch(value || "", patterns.github);
};

export const matches =
    (pattern: RegExp) =>
    (value: string): boolean => {
        return checkMatch(value || "", pattern);
    };

export const isLength =
    (options: { min?: number; max?: number }) =>
    (value: string): boolean => {
        return checkLength(value || "", options);
    };

export const hasCapitals = (value: string): boolean => {
    return checkMatch(value || "", /[A-Z]/);
};

export const hasNumbers = (value: string): boolean => {
    return checkMatch(value || "", /[0-9]/);
};

export const equals =
    (options: { comparison: number }) =>
    (value: string): boolean => {
        return checkEquality(value || "", options.comparison.toString());
    };

export const notEquals =
    (options: { comparison: number }) =>
    (value: string): boolean => {
        return !checkEquality(value || "", options.comparison.toString());
    };

export const isInteger =
    (options: any) =>
    (value: string): boolean => {
        return checkInt(value || "", options);
    };
