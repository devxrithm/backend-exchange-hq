import { Producer, Admin } from "kafkajs";
import kafkaConfig from "../../config/kafka-config/kafka-config";

class KafkaProducer {
  private admin: Admin;
  private producer: Producer;

  constructor() {
    this.producer = kafkaConfig.getClient().producer();
    this.admin = kafkaConfig.getClient().admin();
  }

  async connectToProducer(): Promise<void> {
    await this.admin.connect();
    await this.producer.connect();
    console.log("Kafka Producer connected");
  }

  async sendToConsumer(topic: string, message: string): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          value: message,
        },
      ],
    });

    console.log("Message sent successfully", message);
  }
}

export default new KafkaProducer();
