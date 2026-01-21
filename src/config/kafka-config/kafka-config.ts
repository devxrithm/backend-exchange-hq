import { Kafka, logLevel } from "kafkajs";
import { config } from "../env-config/config";
import fs from "node:fs";
import path from "path";

class KafkaConfig {
  private kafka: Kafka;
  private brokers: string;

  constructor() {
    this.brokers = String(config.KAFKA_URI);
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: [this.brokers],
      ssl: {
        ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
      },
      sasl: {
        mechanism: "plain",
        username: String(config.KAFKA_USERNAME),
        password: String(config.KAFKA_PASSWORD),
      },
      logLevel: logLevel.ERROR,
    });
  }
  getClient(): Kafka {
    return this.kafka;
  }
}

export default new KafkaConfig();

console.log(new KafkaConfig());
