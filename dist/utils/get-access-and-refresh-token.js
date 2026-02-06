"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessAndRefreshToken = void 0;
const auth_model_1 = require("../services/auth-services/auth-model");
const api_error_handling_1 = require("../utils/errors-handler/api-error-handling");
const http_codes_1 = require("../utils/http-codes");
const getAccessAndRefreshToken = async (userId) => {
    try {
        const user = await auth_model_1.Auth.findById(userId);
        if (!user) {
            throw new api_error_handling_1.ApiErrorHandling(http_codes_1.HttpCodes.BAD_REQUEST, "User not found");
        }
        const accessToken = user.GenrateAccessToken();
        const refreshToken = user.GenrateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
        return { accessToken, refreshToken };
    }
    catch (error) {
        if (error instanceof api_error_handling_1.ApiErrorHandling) {
            throw new api_error_handling_1.ApiErrorHandling(error.statusCode, error.message);
        }
        throw new api_error_handling_1.ApiErrorHandling(http_codes_1.HttpCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }
};
exports.getAccessAndRefreshToken = getAccessAndRefreshToken;
//# sourceMappingURL=get-access-and-refresh-token.js.map