"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kafka = void 0;
const kafkajs_1 = require("kafkajs");
const kafka_config_1 = __importDefault(require("../../config/kafka-config/kafka-config"));
const kafkajs_snappy_1 = __importDefault(require("kafkajs-snappy"));
const kafkajs_2 = require("kafkajs");
kafkajs_2.CompressionCodecs[kafkajs_1.CompressionTypes.Snappy] = kafkajs_snappy_1.default;
class KafkaProducer {
    admin;
    producer;
    constructor() {
        this.producer = kafka_config_1.default.getClient().producer({
            idempotent: false,
            maxInFlightRequests: 5,
            allowAutoTopicCreation: false,
            retry: {
                retries: 3,
                maxRetryTime: 3000,
            },
        });
        this.admin = kafka_config_1.default.getClient().admin();
    }
    async connectToProducer() {
        try {
            await this.admin.connect();
            await this.producer.connect();
            console.log("Kafka Producer connected");
        }
        catch (error) {
            console.log(error);
        }
    }
    sendToConsumer(key, topic, message) {
        try {
            this.producer.send({
                topic,
                messages: [
                    {
                        key: `${key}`,
                        value: message,
                    },
                ],
                compression: kafkajs_1.CompressionTypes.Snappy,
                timeout: 5000,
                acks: 0,
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async disconnect() {
        try {
            await this.producer.disconnect();
            await this.admin.disconnect();
        }
        catch (error) {
            console.log(error);
        }
    }
}
const Kafka = new KafkaProducer();
exports.Kafka = Kafka;
//# sourceMappingURL=kafka-producer.js.map