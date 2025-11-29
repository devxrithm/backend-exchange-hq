import { Router } from "express";
import { AuthController } from "./AuthControllers";

const AuthRouter: Router = Router();

AuthRouter.post("/auth/login", AuthController);
AuthRouter.post("/auth/signup", AuthController);

export { AuthRouter };
