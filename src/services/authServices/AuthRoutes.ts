import { Router } from "express";
import { AuthControllers } from "./AuthControllers";
import { verifyJWT } from "../../middleware/JwtVerify";

const AuthRouter: Router = Router();

AuthRouter.post("/auth/login", verifyJWT, AuthControllers.userLogin);
AuthRouter.post("/auth/signup", verifyJWT, AuthControllers.userSignup);
AuthRouter.post("/logout", verifyJWT, AuthControllers.userLogout);

export { AuthRouter };
