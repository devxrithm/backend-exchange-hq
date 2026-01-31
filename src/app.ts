import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./services/auth-services/auth-routes";
import { walletRoutes } from "./services/wallet-services/wallet-routes";
import { initKafkaService } from "./services/kafka-services/kafka-initaliazation";
import { orderRoutes } from "./services/order-services/place-orders/order-routes";
import { redisInit } from "./config/redis-config/redis-initialisatio";

dotenv.config({
  path: "./.env",
});
const app = express();
initKafkaService();
redisInit();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/order", orderRoutes);
// app.get("/order", async (_req, res) => {
//   const order = await Order.find({
//     orderId: "1331b6ad-2358-47e0-88c6-ef4c3e27e357",
//   }).populate("user");

//   console.log(order[0].user);
//   res.status(200).json({ order });
// });
export { app };
