"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoutes = void 0;
const express_1 = require("express");
const export_1 = require("./wallet-controller/export");
const jwt_verify_1 = require("../../middleware/jwt-verify");
const walletRoutes = (0, express_1.Router)();
exports.walletRoutes = walletRoutes;
walletRoutes.patch("/updateuserbalance", jwt_verify_1.verifyJWT, export_1.updateUserBalance);
walletRoutes.post("/createwallet", jwt_verify_1.verifyJWT, export_1.createWallet);
walletRoutes.get("/getuserbalance/:asset", export_1.getUserBalance);
//# sourceMappingURL=wallet-routes.js.map