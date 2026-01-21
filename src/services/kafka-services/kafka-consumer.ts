import { Consumer } from "kafkajs";
import kafkaConfig from "../../config/kafka-config/kafka-config";

class KafkaConsumer {
  private consumer: Consumer;

  constructor() {
    this.consumer = kafkaConfig.getClient().consumer({
      groupId: "post-consumer",
    });
  }

  async connectToConsumer(): Promise<void> {
    await this.consumer.connect();
    console.log("Kafka Consumer connected");
  }

  async subscribeToTopic(topic: string): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: true });
  }

  async consume(callback: (message: string) => void): Promise<void> {
    await this.consumer.run({
      autoCommit: true,
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        console.log(`New Message Recv..`);
        callback(JSON.parse(message?.value?.toString())); //call anonymous function when calling
      },
    });
  }
}

export default new KafkaConsumer();
