import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./services/auth-services/auth-routes";
import { walletRoutes } from "./services/wallet-services/wallet-routes";
import { initKafkaService } from "./services/kafka-services/kafka-initaliazation";
import { orderRoutes } from "./services/order-services/place-orders/order-routes";
import { redisInit } from "./config/redis-config/redis-initialisatio";
import { orderHistoryRoutes } from "./services/order-services/order-history/order-history-routes";
import { config } from "./config/env-config/config";
import { orderBookRoutes } from "./services/order-services/orderbook/order-book-route";
import { WebSocketServer } from 'ws';
import { createServer } from "http";

dotenv.config({
  path: "./.env",
});
const app = express();
const httpServer = createServer(app);
export const wss = new WebSocketServer({ server: httpServer });

initKafkaService();
redisInit();

app.use(
  cors({
    origin: config.CORS_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

//websocket connecttion...........
wss.on("connection", function connection(ws, req) {
  console.log("WebSocket connection established from:", req.socket.remoteAddress);

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send("something");
  });

  ws.on("close", function () {
    console.log("WebSocket connection closed");
  });
});

//routes.............
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/order-history", orderHistoryRoutes);
app.use("/api/order-book", orderBookRoutes);

export { app, httpServer };
