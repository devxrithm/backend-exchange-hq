"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initKafkaService = void 0;
const bulk_insertion_1 = require("./bulk-insertion");
const kafka_consumer_1 = __importDefault(require("../../config/kafka-config/kafka-consumer"));
const kafka_producer_1 = require("../../config/kafka-config/kafka-producer");
const messages = [];
const initKafkaService = async () => {
    try {
        await kafka_producer_1.Kafka.connectToProducer();
        await kafka_consumer_1.default.connectToConsumer();
        await kafkaConsume();
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
exports.initKafkaService = initKafkaService;
const kafkaConsume = async () => {
    try {
        await kafka_consumer_1.default.subscribeToTopic("orders-detail");
        // Set up interval once, not per message
        setInterval(() => (0, bulk_insertion_1.bulkInsertion)(messages), 5000);
        await kafka_consumer_1.default.consume(async (message) => {
            // Add message to the batch
            messages.push(message);
            // Immediate bulk insertion if threshold reached
            if (messages.length >= 1000) {
                await (0, bulk_insertion_1.bulkInsertion)(messages);
                messages.length = 0;
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
//# sourceMappingURL=kafka-initaliazation.js.map