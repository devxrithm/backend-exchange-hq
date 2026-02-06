"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtVerifyRefreshToken = exports.jwtVerifyAccessToken = exports.refreshTokenJwtSign = exports.accessTokenJwtSign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/env-config/config");
const accessTokenJwtSign = (UserPayLoad) => jsonwebtoken_1.default.sign({
    UserPayLoad,
}, config_1.config.ACCESS_TOKEN_SECRET, //why we use as Secret? because we are using the secret key as a string and we need to convert it to a Secret type because jwt.sign function expects a Secret type but we are passing a config object which is a string
{
    expiresIn: config_1.config.ACCESS_TOKEN_EXPIRY,
} //why we use as SignOptions? because we are using the expiry time as a string and we need to convert it to a SignOptions type because jwt.sign function expects a SignOptions type but we are passing a config object which is a type of string and we need to convert it to a SignOptions type
);
exports.accessTokenJwtSign = accessTokenJwtSign;
const refreshTokenJwtSign = (UserPayLoad) => jsonwebtoken_1.default.sign({
    UserPayLoad,
}, config_1.config.REFRESH_TOKEN_SECRET, //why we use as Secret? because we are using the secret key as a string and we need to convert it to a Secret type because jwt.sign function expects a Secret type but we are passing a config object which is a string
{
    expiresIn: config_1.config.REFRESH_TOKEN_EXPIRY,
} //why we use as SignOptions? because we are using the expiry time as a string and we need to convert it to a SignOptions type because jwt.sign function expects a SignOptions type but we are passing a config object which is a type of string and we need to convert it to a SignOptions type
);
exports.refreshTokenJwtSign = refreshTokenJwtSign;
const jwtVerifyAccessToken = (Token) => jsonwebtoken_1.default.verify(Token, config_1.config.ACCESS_TOKEN_SECRET);
exports.jwtVerifyAccessToken = jwtVerifyAccessToken;
const jwtVerifyRefreshToken = (Token) => jsonwebtoken_1.default.verify(Token, config_1.config.REFRESH_TOKEN_SECRET);
exports.jwtVerifyRefreshToken = jwtVerifyRefreshToken;
//# sourceMappingURL=Jwt.js.map