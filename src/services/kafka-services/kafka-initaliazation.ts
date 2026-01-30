// import { Order } from "../order-services/order-model";
// import { orderMatchingEngine } from "../orders-matching-engine";
import kafkaConsumer from "./kafka-consumer";
import { Kafka } from "./kafka-producer";

export const initKafkaService = async () => {
  try {
    await Kafka.connectToProducer();
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

    // await kafkaConsumer.consume(async (message) => {
    //   // if (message.length > 100) {
    //   //   await Order.create(message);
    //   // }

    //   // console.log("order matching started");
    //   // console.log(message);
    //   // console.log("order matching started");
    //   // const trades = await orderMatchingEngine(message);
    //   // console.log("order matching ended");
    //   // console.log(trades);
    // });
  } catch (error) {
    // await kafkaConsumer.consume(async (message) => {
    //   await Order.create(message);
    // });
    console.log(error);
  }
};
