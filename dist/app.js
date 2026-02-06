"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = require("./services/auth-services/auth-routes");
const wallet_routes_1 = require("./services/wallet-services/wallet-routes");
const kafka_initaliazation_1 = require("./services/kafka-services/kafka-initaliazation");
const order_routes_1 = require("./services/order-services/place-orders/order-routes");
const redis_initialisatio_1 = require("./config/redis-config/redis-initialisatio");
const order_history_routes_1 = require("./services/order-services/order-history/order-history-routes");
dotenv_1.default.config({
    path: "./.env",
});
const app = (0, express_1.default)();
exports.app = app;
(0, kafka_initaliazation_1.initKafkaService)();
(0, redis_initialisatio_1.redisInit)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); //for managing cookies
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_1.authRoutes);
app.use("/api/wallet", wallet_routes_1.walletRoutes);
app.use("/api/order", order_routes_1.orderRoutes);
app.use("/api/order-history", order_history_routes_1.orderHistoryRoutes);
//# sourceMappingURL=app.js.map