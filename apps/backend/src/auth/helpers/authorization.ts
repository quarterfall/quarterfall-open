import express from "express";

export const hasAuthentication = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: "Not authorized",
        });
    }
};

export const hasAdminRights = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (
        req.isAuthenticated() &&
        (req?.session as any)?.passport?.user?.sysAdmin === true
    ) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: "Not authorized",
    });
};
