"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderHistoryRoutes = void 0;
const express_1 = require("express");
const jwt_verify_1 = require("../../../middleware/jwt-verify");
const order_history_controller_1 = require("./order-history-controller");
const orderHistoryRoutes = (0, express_1.Router)();
exports.orderHistoryRoutes = orderHistoryRoutes;
orderHistoryRoutes.get("/", jwt_verify_1.verifyJWT, order_history_controller_1.orderHistoryController);
//# sourceMappingURL=order-history-routes.js.map