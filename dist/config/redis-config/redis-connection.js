"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = void 0;
const redis_1 = require("redis");
// import { config } from "../env-config/config";
class RedisConnection {
    redis;
    isConnected = false;
    constructor() {
        this.redis = (0, redis_1.createClient)();
        // {
        //       url: config.REDIS_URI,
        //     }
        this.redis.on("error", (err) => {
            console.error("Redis Client Error:", err);
        });
        this.redis.on("connect", () => {
            console.log("Redis connecting...");
        });
    }
    async connect() {
        await this.redis.connect();
        this.isConnected = true;
        console.log("Successfully connected to Redis");
    }
    getClient() {
        if (!this.isConnected) {
            throw new Error("Redis not connected. Call Redis.connect() first.");
        }
        return this.redis;
    }
}
const Redis = new RedisConnection();
exports.Redis = Redis;
//# sourceMappingURL=redis-connection.js.map