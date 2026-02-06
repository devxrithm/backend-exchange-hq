"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
// import { verifyJWT } from "../../../middleware/jwt-verify";
const export_1 = require("./orders-controllers/export");
const order_close_position_1 = require("./orders-controllers/order-close-position");
const orderRoutes = (0, express_1.Router)();
exports.orderRoutes = orderRoutes;
// orderRoutes.post("/buyorder", verifyJWT, buyOrder);
orderRoutes.post("/buyorder", export_1.buyOrder);
orderRoutes.post("/sellorder", export_1.sellOrder);
// orderRoutes.post("/sellorder", verifyJWT, sellOrder);
// orderRoutes.get("/openPositions", verifyJWT, openPosition);
orderRoutes.get("/openPositions", export_1.openPosition);
orderRoutes.get("/closedPositions", order_close_position_1.closePosition);
//# sourceMappingURL=order-routes.js.map