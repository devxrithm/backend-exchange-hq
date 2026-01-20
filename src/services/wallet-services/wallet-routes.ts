import Router from "express";
import {
  getUserBalance,
  updateUserBalance,
  createWallet,
} from "./wallet-controllers";
import { verifyJWT } from "../../middleware/jwt-verify";

const walletRouter = Router();

walletRouter.patch("/updateuserbalance", verifyJWT, updateUserBalance);
walletRouter.post("/createwallet", verifyJWT, createWallet);
walletRouter.get("/getuserbalance", verifyJWT, getUserBalance);

export { walletRouter };
