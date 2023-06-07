import {
    loginAsUser,
    logout,
    magicLoginComplete,
    startLogin,
    startRegistration,
    startSurfconextLogin,
    surfconextLoginComplete,
} from "auth/controllers";
import { hasAdminRights } from "auth/helpers/authorization";
import express = require("express");
const router = express.Router();

router.post("/register", startRegistration);

router.post("/login", startLogin);
router.post("/loginAs", hasAdminRights, loginAsUser);

router.get("/login/sso/surfconext", startSurfconextLogin);
router.get("/login/sso/surfconext/complete", surfconextLoginComplete);
router.get("/login/magic/complete", magicLoginComplete);

router.post("/logout", logout);

export default router;
