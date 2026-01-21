import { Producer, Message, Admin } from "kafkajs";
import kafkaConfig from "../../config/kafka-config/kafka-config";

class KafkaProducer {
  private admin: Admin;
  private producer: Producer;

  constructor() {
    this.producer = kafkaConfig.getClient().producer();
    this.admin = kafkaConfig.getClient().admin();
  }

  async connect(): Promise<void> {
    await this.admin.connect();
    await this.producer.connect();
    console.log("Kafka Producer connected");
  }

  async send(topic: string, messages: Message[]): Promise<void> {
    await this.producer.send({
      topic,
      messages,
    });
  }
}

export default new KafkaProducer();
