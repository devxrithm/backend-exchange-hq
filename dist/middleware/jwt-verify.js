"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const auth_model_1 = require("../services/auth-services/auth-model");
const utils_export_1 = require("../utils/utils-export");
const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new utils_export_1.ApiErrorHandling(400, "token invalid");
        }
        const decodedToken = (0, utils_export_1.jwtVerifyAccessToken)(token);
        if (!decodedToken) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "Invalid Token");
        }
        const user = await auth_model_1.Auth.findById(decodedToken.UserPayLoad._id).select("-password -refreshToken");
        if (!user) {
            throw new utils_export_1.ApiErrorHandling(401, "Invalid Access Token");
        }
        req.user = Object(user);
        next();
    }
    catch (error) {
        if (error instanceof utils_export_1.ApiErrorHandling) {
            res
                .status(error.statusCode)
                .json(new utils_export_1.ApiResponse(error.statusCode, null, error.message));
        }
        res
            .status(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR)
            .json(new utils_export_1.ApiResponse(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error"));
    }
};
exports.verifyJWT = verifyJWT;
//# sourceMappingURL=jwt-verify.js.map