import { createClient, RedisClientType } from "redis";
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
        password: "mYuGy0agt0qD44s9yUI1jacH3L3IpB6g",
        socket: {
          host: "redis-15109.crce179.ap-south-1-1.ec2.cloud.redislabs.com",
          port: 15109,
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

export default new RedisConnection();
