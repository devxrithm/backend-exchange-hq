import { Router } from "express";
import {
  userLogin,
  userSignup,
  userLogout,
  genrateNewAccessAndRefreshToken,
} from "./auth-controllers";
import { verifyJWT } from "../../middleware/jwt-verify";

const authRouter: Router = Router();

authRouter.post("/login", userLogin);
authRouter.post("/signup", userSignup);
authRouter.post("/logout", verifyJWT, userLogout);
authRouter.get(
  "/new-refresh-token",
  verifyJWT,
  genrateNewAccessAndRefreshToken
);

export { authRouter };
