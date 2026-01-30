import { createClient, RedisClientType } from "redis";
import { config } from "../env-config/config";
// import { config } from "../env-config/config";

class RedisConnection {
  private redis!: RedisClientType;

  constructor() {
    if (this.redis) {
      console.log("already connected to redis");
      return;
    }
    try {
      this.redis = createClient({
        username: "default",
        password: config.REDIS_PASSWORD,
        socket: {
          host: config.REDIS_URI,
          port: Number(config.REDIS_PORT),
          connectTimeout: 10000,
        },
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
