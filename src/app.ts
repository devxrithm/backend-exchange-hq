import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./services/auth-services/auth-routes";
import { walletRouter } from "./services/wallet-services/wallet-routes";

dotenv.config({
  path: "./.env",
});
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api", walletRouter);

export { app };
