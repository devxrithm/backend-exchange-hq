import { Router } from "express";
import { verifyJWT } from "../../middleware/jwt-verify";

const orderRoutes: Router = Router();

orderRoutes.patch("/buyorder", verifyJWT, updateUserBalance);
orderRoutes.post("/sellorder", verifyJWT, createWallet);
// orderRoutes.get("/getuserbalance", verifyJWT, getUserBalance);

export { orderRoutes };
