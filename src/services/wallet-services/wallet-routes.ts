import { Router } from "express";
import {
  createWallet,
  updateUserBalance,
  getUserBalance,
} from "./wallet-controller/export";

import { verifyJWT } from "../../middleware/jwt-verify";

const walletRoutes: Router = Router();

walletRoutes.patch("/updateuserbalance", verifyJWT, updateUserBalance);
walletRoutes.post("/createwallet", verifyJWT, createWallet);
walletRoutes.get("/getuserbalance/:asset", getUserBalance);
// walletRoutes.get("/getuserbalance/:asset", verifyJWT, getUserBalance);

export { walletRoutes };
