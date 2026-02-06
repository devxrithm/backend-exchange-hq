"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controllers_1 = require("./auth-controllers");
const jwt_verify_1 = require("../../middleware/jwt-verify");
const authRoutes = (0, express_1.Router)();
exports.authRoutes = authRoutes;
authRoutes.post("/login", auth_controllers_1.userLogin);
authRoutes.post("/signup", auth_controllers_1.userSignup);
authRoutes.post("/logout", jwt_verify_1.verifyJWT, auth_controllers_1.userLogout);
authRoutes.get("/new-refresh-token", jwt_verify_1.verifyJWT, auth_controllers_1.genrateNewAccessAndRefreshToken);
//# sourceMappingURL=auth-routes.js.map