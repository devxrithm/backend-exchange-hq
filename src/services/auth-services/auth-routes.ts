import { Router } from "express";
import {
  userLogin,
  userSignup,
  userLogout,
  genrateNewAccessAndRefreshToken,
} from "./auth-controllers";
import { verifyJWT } from "../../middleware/jwt-verify";

const authRoutes: Router = Router();

authRoutes.post("/login", userLogin);
authRoutes.post("/signup", userSignup);
authRoutes.post("/logout", verifyJWT, userLogout);
authRoutes.post(
  "/new-refresh-token",
  genrateNewAccessAndRefreshToken,
);

export { authRoutes };
