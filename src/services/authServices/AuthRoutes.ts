import { Router } from "express";
import {
  userLogin,
  userSignup,
  userLogout,
  genrateNewAccessAndRefreshToken,
} from "./AuthControllers";
import { verifyJWT } from "../../middleware/JwtVerify";

const AuthRouter: Router = Router();

AuthRouter.post("/auth/login", userLogin);
AuthRouter.post("/auth/signup", userSignup);
AuthRouter.post("/auth/logout", verifyJWT, userLogout);
AuthRouter.get(
  "/auth/new-refresh-token",
  verifyJWT,
  genrateNewAccessAndRefreshToken
);

export { AuthRouter };
