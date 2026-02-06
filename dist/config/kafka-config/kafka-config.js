"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const config_1 = require("../env-config/config");
const node_fs_1 = __importDefault(require("node:fs"));
const path_1 = __importDefault(require("path"));
class KafkaConfig {
    kafka;
    brokers;
    constructor() {
        this.brokers = String(config_1.config.KAFKA_URI);
        this.kafka = new kafkajs_1.Kafka({
            clientId: "my-app",
            brokers: [this.brokers],
            ssl: {
                ca: [node_fs_1.default.readFileSync(path_1.default.resolve("./ca.pem"), "utf-8")],
            },
            sasl: {
                mechanism: "plain",
                username: String(config_1.config.KAFKA_USERNAME),
                password: String(config_1.config.KAFKA_PASSWORD),
            },
            logLevel: kafkajs_1.logLevel.ERROR,
        });
    }
    getClient() {
        return this.kafka;
    }
}
exports.default = new KafkaConfig();
//# sourceMappingURL=kafka-config.js.map