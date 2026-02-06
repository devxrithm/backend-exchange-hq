declare class KafkaProducer {
    private admin;
    private producer;
    constructor();
    connectToProducer(): Promise<void>;
    sendToConsumer(key: string, topic: string, message: string): void;
    disconnect(): Promise<void>;
}
declare const Kafka: KafkaProducer;
export { Kafka };
//# sourceMappingURL=kafka-producer.d.ts.map