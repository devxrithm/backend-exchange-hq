import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./services/auth-services/auth-routes";
import { walletRouter } from "./services/wallet-services/wallet-routes";
import { initKafkaService } from "./config/kafka-config/kafka-initaliazation";

dotenv.config({
  path: "./.env",
});
const app = express();
initKafkaService();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/wallet", walletRouter);

export { app };
