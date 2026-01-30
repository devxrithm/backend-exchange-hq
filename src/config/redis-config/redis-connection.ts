import { createClient } from "redis";
import { config } from "../env-config/config";

class RedisConnection {
  constructor() {
    try {
      this.redis = createClient({
        url: config.REDIS_URI,
      });
      this.redis.on("error", (err: unknown) =>
        console.log("Redis Client Error", err),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async RedisConnection(): Promise<void> {
    await this.redis.connect();
    console.log("Successfully connected to Redis");
  }

  getClient() {
    return this.redis;
  }
}

const Redis = new RedisConnection();
export { Redis };
