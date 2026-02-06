import { RedisClientType } from "redis";
declare class RedisConnection {
    private redis;
    private isConnected;
    constructor();
    connect(): Promise<void>;
    getClient(): RedisClientType;
}
declare const Redis: RedisConnection;
export { Redis };
//# sourceMappingURL=redis-connection.d.ts.map