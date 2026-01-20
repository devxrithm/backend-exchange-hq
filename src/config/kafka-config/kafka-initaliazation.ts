import kafkaConfig from "./kafka-config";
import KafkaConfig from "./kafka-config";

export const initKafkaService = async () => {
  try {
    await KafkaConfig.connect();
    await kafkaConfig.createTopic("orders");
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
};
