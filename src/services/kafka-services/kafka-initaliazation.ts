import { IOrder, Order } from "../order-services/order-model";
import { orderMatchingEngine } from "../orders-matching-engine";
import kafkaConsumer from "./kafka-consumer";
import { Kafka } from "./kafka-producer";

const messages: IOrder[] = [];
let processing = false;
let intervalId: NodeJS.Timeout | null = null;

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
    if (!intervalId) {
      intervalId = setInterval(bulkInsertion, 5000);
    }

    await kafkaConsumer.consume(async (message) => {
      // Add message to the batch
      messages.push(message);

      // Immediate bulk insertion if threshold reached
      if (messages.length >= 1000) {
        await bulkInsertion();
      }

      // const [trade] = await orderMatchingEngine(message);


      console.log("matching done");
    });
  } catch (error) {
    console.log(error);
  }
};

const bulkInsertion = async () => {
  if (messages.length > 0 && !processing) {
    processing = true;
    const batchToProcess = [...messages]; //copy all messages to this variable
    messages.length = 0;

    try {
      await Order.insertMany(batchToProcess);
      console.log(`Inserted ${batchToProcess.length} orders`);
    } catch (error) {
      console.log("Bulk insertion error:", error);
      messages.push(...batchToProcess); // Re-add failed batch
    } finally {
      processing = false; // Always reset processing flag
    }
  }
};
