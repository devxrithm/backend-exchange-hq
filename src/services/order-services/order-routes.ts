import { Router } from "express";
import { verifyJWT } from "../../middleware/jwt-verify";
import {
  buyOrder,
  openPosition,
  sellOrder,
} from "./orders-utils/orders-controller";

const orderRoutes: Router = Router();

// orderRoutes.post("/buyorder", verifyJWT, buyOrder);
orderRoutes.post("/buyorder", buyOrder);
orderRoutes.post("/sellorder", verifyJWT, sellOrder);
// orderRoutes.get("/openPositions", verifyJWT, openPosition);
orderRoutes.get("/openPositions", openPosition);
// orderRoutes.get("/closedPositions", verifyJWT, openPosition);

export { orderRoutes };
