import { JwtPayload } from "jsonwebtoken";
interface payload extends JwtPayload {
    _id: string;
    email?: string;
    fullname?: string;
}
export declare const accessTokenJwtSign: (UserPayLoad: payload) => string;
export declare const refreshTokenJwtSign: (UserPayLoad: payload) => string;
export declare const jwtVerifyAccessToken: (Token: string) => payload;
export declare const jwtVerifyRefreshToken: (Token: string) => payload;
export {};
//# sourceMappingURL=Jwt.d.ts.map