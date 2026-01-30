import { orderHistory } from "../order-services/order-history/order-history-model";
import { IOrder, Order } from "../order-services/place-orders/order-model";
import { orderMatchingEngine } from "../orders-matching-engine";
import kafkaConsumer from "./kafka-consumer";
import { Kafka } from "./kafka-producer";

const messages: IOrder[] = [];
let processing = false;

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

    // Set up interval once, not per message
    setInterval(bulkInsertion, 5000);

    await kafkaConsumer.consume(async (message) => {
      // Add message to the batch
      messages.push(message);

      // Immediate bulk insertion if threshold reached
      if (messages.length >= 1000) {
        await bulkInsertion();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const bulkInsertion = async () => {
  if (processing || messages.length === 0) return;
  processing = true;
  const batch = messages.splice(0, 1000);
  //Start at index 0 and Remove 1000 elements and finally Return those 1000 elements

  try {
    await Order.insertMany(batch, { ordered: true });

    for (const order of batch) {

      const trades = await orderMatchingEngine(order);
      console.log(trades)

      if (trades?.length) {
        await orderHistory.insertMany(trades);
      }
    }
    console.log(`Processed ${batch.length} orders`);
  } catch (error) {
    console.error("Flush failed:", error);
    messages.push(...batch);
  }finally {
    processing = false;
  }
};
