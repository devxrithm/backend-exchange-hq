import redisConnection from "./redis-connection";

export const redisInit = async () => {
  try {
    await redisConnection.RedisConnection();
  } catch (error) {
    console.log(error);
  }
};
