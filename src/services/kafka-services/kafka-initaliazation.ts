import { Order } from "../order-services/order-model";
import kafkaConsumer from "./kafka-consumer";
import kafkaProducer from "./kafka-producer";

export const initKafkaService = async () => {
  try {
    await kafkaProducer.connectToProducer();
    await kafkaConsumer.connectToConsumer();
    await kafkaConsume();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

interface IBuyRequestBody {
  user: string;
  orderId: string;
  orderSide: "BUY" | "SELL"; // USDT
  currencyPair: string;
  orderType: "market";
  entryPrice: number;
  positionStatus: "open" | "closed";
  orderAmount: number;
  orderQuantity: number;
}

const kafkaConsume = async () => {
  try {
    await kafkaConsumer.subscribeToTopic("orders");

    await kafkaConsumer.consume(async (message) => {
      console.log("at initialization");
      console.log(message);
      const order: IBuyRequestBody | string = message;
      await Order.create(order);
    });
  } catch (error) {
    console.log(error);
  }
};
