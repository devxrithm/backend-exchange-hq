import { IOrder } from "../../services/order-services/place-orders/order-model";
declare class KafkaConsumer {
    private consumer;
    constructor();
    connectToConsumer(): Promise<void>;
    subscribeToTopic(topic: string): Promise<void>;
    consume(callback: (kafkaMessage: IOrder) => void): Promise<void>;
    disconnect(): Promise<void>;
}
declare const _default: KafkaConsumer;
export default _default;
//# sourceMappingURL=kafka-consumer.d.ts.map