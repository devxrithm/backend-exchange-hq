import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AuthRouter } from "./services/authServices/AuthRoutes";

dotenv.config({
  path: "./.env",
});
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

app.use("/api", AuthRouter);

export { app };
