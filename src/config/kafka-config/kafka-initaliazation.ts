import KafkaConfig from "./kafka-config";

export const initKafkaService = async () => {
  try {
    console.log("topic creation in progress");
    await KafkaConfig.connect();
    console.log("topic creation is success");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
