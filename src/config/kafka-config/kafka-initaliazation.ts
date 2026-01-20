import KafkaConfig from "./kafka-config";

export const initKafkaService = async () => {
  try {
    await KafkaConfig.connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
