import { Kafka } from "kafkajs";
declare class KafkaConfig {
    private kafka;
    private brokers;
    constructor();
    getClient(): Kafka;
}
declare const _default: KafkaConfig;
export default _default;
//# sourceMappingURL=kafka-config.d.ts.map