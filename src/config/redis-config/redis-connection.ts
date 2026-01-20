import { Redis } from "ioredis";
import { config } from "../env-config/config";

class RedisConnection {
  private redis: Redis;
  constructor() {
    this.redis = new Redis({
      port: config.REDIS_PORT,
      host: config.REDIS_URI,
      password: config.REDIS_PASSWORD,
    });
  }
}

export default new RedisConnection();
