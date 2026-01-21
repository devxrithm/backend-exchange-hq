import kafkaProducer from "./kafka-producer";

export const initKafkaService = async () => {
  try {
    await kafkaProducer.connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
