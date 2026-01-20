import { Producer, Admin, Kafka, logLevel, Message } from "kafkajs";
import { config } from "../env-config/config";
// import { config } from "../env-config/config";

class KafkaConfig {
  private producer: Producer;
  private admin: Admin;
  private brokers: string;
  private kafka: Kafka;

  constructor() {
    this.brokers = String(config.KAFKA_URI);

    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: [this.brokers],
      sasl: {
        mechanism: "plain", // scram-sha-256 or scram-sha-512
        username: String(config.KAFKA_USERNAME),
        password: String(config.KAFKA_PASSWORD),
      },
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.admin.connect();
    } catch (error) {
      console.log(error);
    }
  }

  async createTopic(topic: string): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [{ topic, numPartitions: 1 }],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendToTopic(topic: string, messages: Message[]): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new KafkaConfig();
