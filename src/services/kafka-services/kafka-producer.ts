import { Producer, Admin } from "kafkajs";
import kafkaConfig from "../../config/kafka-config/kafka-config";

class KafkaProducer {
  private admin: Admin;
  private producer: Producer;

  constructor() {
    this.producer = kafkaConfig.getClient().producer({
      allowAutoTopicCreation: false,
      retry: {
        retries: 5,
      },
    });
    this.admin = kafkaConfig.getClient().admin();
  }

  async connectToProducer(): Promise<void> {
    try {
      await this.admin.connect();
      await this.producer.connect();
      console.log("Kafka Producer connected");
    } catch (error) {
      console.log(error);
    }
  }

  async sendToConsumer(topic: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: message,
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.admin.disconnect();
    } catch (error) {
      console.log(error);
    }
  }
}

const Kafka = new KafkaProducer();
export { Kafka };
