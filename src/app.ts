import express, { Request } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./services/auth-services/auth-routes";
import { walletRoutes } from "./services/wallet-services/wallet-routes";
import { initKafkaService } from "./services/kafka-services/kafka-initaliazation";
import kafkaProducer from "./services/kafka-services/kafka-producer";
import kafkaConsumer from "./services/kafka-services/kafka-consumer";
import { orderRoutes } from "./services/order-services/order-routes";


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
app.use("/api/order", orderRoutes);

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

app.get("/get", async (_req, res) => {
  // console.log(req.body);
  // const { orderID, symbols } = req.body;

  await kafkaConsumer.subscribeToTopic("orders");
  await kafkaConsumer.consume(async (message) => {
    console.log("message receiving started", message);
  });
  res.status(200).json({
    message: "post get succesfully",
  });
});

export { app };
