"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_config_1 = __importDefault(require("../../config/kafka-config/kafka-config"));
class KafkaConsumer {
    consumer;
    constructor() {
        this.consumer = kafka_config_1.default.getClient().consumer({
            groupId: "orders-deatils",
        });
    }
    async connectToConsumer() {
        await this.consumer.connect();
        console.log("Kafka Consumer connected");
    }
    async subscribeToTopic(topic) {
        await this.consumer.subscribe({ topic, fromBeginning: true });
    }
    async consume(callback) {
        await this.consumer.run({
            autoCommit: true,
            eachMessage: async ({ message }) => {
                if (!message.value)
                    return;
                try {
                    const parsedMessage = JSON.parse(message.value.toString());
                    callback(parsedMessage);
                }
                catch (err) {
                    console.error("Invalid JSON message", err);
                }
            },
        });
    }
    async disconnect() {
        try {
            await this.consumer.disconnect();
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = new KafkaConsumer();
//# sourceMappingURL=kafka-consumer.js.map