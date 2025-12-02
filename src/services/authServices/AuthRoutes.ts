import { Router } from "express";
import {
  userLogin,
  userSignup,
  userLogout,
  genrateNewAccessAndRefreshToken,
} from "./AuthControllers";
import { verifyJWT } from "../../middleware/JwtVerify";

const AuthRouter: Router = Router();

AuthRouter.post("/auth/login", verifyJWT, userLogin);
AuthRouter.post("/auth/signup", verifyJWT, userSignup);
AuthRouter.post("/auth/logout", verifyJWT, userLogout);
AuthRouter.post(
  "/auth/new-refresh-token",
  verifyJWT,
  genrateNewAccessAndRefreshToken
);

export { AuthRouter };
