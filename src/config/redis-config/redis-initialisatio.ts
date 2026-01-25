import { Redis } from "./redis-connection";

export const redisInit = async () => {
  try {
    await Redis.RedisConnection();
  } catch (error) {
    console.log(error);
  }
};
