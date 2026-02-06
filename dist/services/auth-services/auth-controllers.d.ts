import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/jwt-verify";
declare const userSignup: (req: Request<{}, {}, {
    fullName: string;
    userName: string;
    password: string;
    email: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const userLogin: (req: Request<{}, {}, {
    email: string;
    password: string;
}>, res: Response) => Promise<void>;
declare const userLogout: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const genrateNewAccessAndRefreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { userLogin, userSignup, userLogout, genrateNewAccessAndRefreshToken };
//# sourceMappingURL=auth-controllers.d.ts.map