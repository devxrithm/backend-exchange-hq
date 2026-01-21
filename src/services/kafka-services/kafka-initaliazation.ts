import kafkaConsumer from "./kafka-consumer";
import kafkaProducer from "./kafka-producer";

export const initKafkaService = async () => {
  try {
    await kafkaProducer.connectToProducer();
    await kafkaConsumer.connectToConsumer();

    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
