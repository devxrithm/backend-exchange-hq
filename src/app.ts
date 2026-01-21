import express, { Request } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./services/auth-services/auth-routes";
import { walletRoutes } from "./services/wallet-services/wallet-routes";
import { initKafkaService } from "./services/kafka-services/kafka-initaliazation";
import kafkaProducer from "./services/kafka-services/kafka-producer";

dotenv.config({
  path: "./.env",
});
const app = express();
initKafkaService();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); //for managing cookies
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.post(
  "/post",
  async (req: Request<{}, {}, { orderID: string; symbols: string }>, res) => {
    console.log(req.body);
    const { orderID, symbols } = req.body;

    await kafkaProducer.sendToConsumer(
      "orders",
      JSON.stringify({ orderID, symbols }),
    );
    res.status(200).json({
      message: "post created",
    });
  },
);

export { app };
