import {
  ApiErrorHandling,
  AuthRequest,
  HttpCodes,
  IBuyRequestBody,
  Response,
  Redis,
  ApiResponse,
  Kafka,
  Wallet,
} from "./orders-controller";
import { v4 as uuidv4 } from "uuid";

export const buyOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const uuid = uuidv4();
    const {
      currencyPair,
      orderSide,
      orderType,
      entryPrice,
      positionStatus,
      orderAmount,
    }: IBuyRequestBody = req.body;

    //fetch userid from middleware
    // const userId = req.user?._id;
    const userId = "696f330085f796568d1339ea";
    if (!userId) {
      throw new ApiErrorHandling(
        HttpCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }
    //calculate qty so that it can use as globally
    const orderQuantity = orderAmount / entryPrice;

    const redisKey = `wallet:${userId}:usdt:balance`;
    const wallet = await Redis.getClient().get(redisKey);

    let walletBalance = Number(wallet);
    // console.log(walletBalance);
    if (walletBalance === 0) {
      const walletDB = await Wallet.findOne({
        user: userId,
        asset: "USDT",
      }).lean();
      if (!walletDB) {
        throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "wallet not created");
      }

      walletBalance = Number(walletDB.balance);
      //push cached wallet to redis
      await Redis.getClient().set(redisKey, walletBalance);
    }

    if (orderAmount > walletBalance) {
      throw new ApiErrorHandling(
        HttpCodes.BAD_REQUEST,
        "Insufficient USDT balance",
      );
    }
    const buyOrder = {
      user: userId.toString(),
      orderId: uuid,
      orderSide,
      currencyPair: currencyPair,
      orderType,
      entryPrice: entryPrice.toString(),
      positionStatus,
      orderAmount: orderAmount.toString(),
      orderQuantity: orderQuantity.toString(),
    };

    //push to kafka
    // console.time("kafka-send");
    Kafka.sendToConsumer(
      currencyPair,
      "orders-detail",
      JSON.stringify(buyOrder),
    );
    // console.timeEnd("kafka-send");

    //push to redis
    // console.time("redis-pipeline");

    const pipeline = Redis.getClient().multi();
    pipeline.hSetEx(`orderdetail:orderID:${uuid}`, buyOrder, {
      expiration: {
        type: "EX",
        value: 5000,
      },
    });
    pipeline.sAdd(`openOrders:userId${userId}`, uuid);
    await pipeline.exec();
    // console.timeEnd("redis-pipeline");

    return res
      .status(HttpCodes.OK)
      .json(
        new ApiResponse(HttpCodes.OK, buyOrder, "Trade placed successfully"),
      );
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            HttpCodes.INTERNAL_SERVER_ERROR,
            null,
            "Internal Server Error",
          ),
        );
    }
  }
};
