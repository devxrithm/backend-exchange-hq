import { Request, RequestHandler } from "express";
export interface AuthRequest extends Request {
    user?: {
        _id: string;
        fullname: string;
        email: string;
    };
}
declare const verifyJWT: RequestHandler;
export { verifyJWT };
//# sourceMappingURL=jwt-verify.d.ts.map