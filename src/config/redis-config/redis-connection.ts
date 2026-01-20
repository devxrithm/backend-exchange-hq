import { Redis } from "ioredis";

class RedisConnection {
  private redis: Redis;
  constructor() {
    this.redis = new Redis();
  }
}

export default new RedisConnection();
