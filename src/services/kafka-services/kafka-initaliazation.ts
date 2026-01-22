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

const kafkaConsume = async () => {
  try {
    await kafkaConsumer.subscribeToTopic("orders-detail");

    await kafkaConsumer.consume(async (message) => {
      console.log("at initialization");
      console.log(message);
      await Order.create(message);
    });
  } catch (error) {
    await kafkaConsumer.consume(async (message) => {
      console.log("at error");
      await Order.create(message);
    });
    console.log(error);
  }
};
