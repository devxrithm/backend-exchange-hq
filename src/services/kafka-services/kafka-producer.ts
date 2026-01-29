import { Producer, Admin, CompressionTypes } from "kafkajs";
import kafkaConfig from "../../config/kafka-config/kafka-config";

import SnappyCodec from "kafkajs-snappy";
import { CompressionCodecs } from "kafkajs";
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

class KafkaProducer {
  private admin: Admin;
  private producer: Producer;

  constructor() {
    this.producer = kafkaConfig.getClient().producer({
      idempotent: false,
      maxInFlightRequests: 1,
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

  async sendToConsumer(
    key: string,
    topic: string,
    message: string,
  ): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: `${key}`,
            value: message,
          },
        ],
        compression: CompressionTypes.Snappy,
        timeout: 30000,
        acks: -1,
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
