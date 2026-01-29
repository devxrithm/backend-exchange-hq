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
    const redisKey = `wallet:${userId}:usdt`;
    const wallet = await Redis.getClient().hmGet(redisKey, [
      "asset",
      "balance",
    ]);

    if (wallet[1] != null) {
      const walletBalance = wallet[1];
      if (orderAmount > Number(walletBalance)) {
        throw new ApiErrorHandling(
          HttpCodes.BAD_REQUEST,
          "Insufficient USDT balance",
        );
      }

      const orderQuantity = orderAmount / entryPrice;

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
      // console.log("push to kafka");
      //push to kafka
      Kafka.sendToConsumer(
        currencyPair,
        "orders-detail",
        JSON.stringify(buyOrder),
      );

      //push to redis
      await Promise.all([
        Redis.getClient().hSet(`orderdetail:orderID:${uuid}`, buyOrder),
        Redis.getClient().expire(`orderdetail:orderID:${uuid}`, 5000),
        Redis.getClient().sAdd(`openOrders:userId${userId}`, uuid),
      ]);

      return res
        .status(HttpCodes.OK)
        .json(
          new ApiResponse(
            HttpCodes.OK,
            buyOrder,
            "Trade placed successfully from redis wallet",
          ),
        );
    }

    //fetch from DB
    const walletDB = await Wallet.findOne({ user: userId, asset: "USDT" });
    if (!walletDB) {
      throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "wallet not created");
    }

    const orderQuantity = orderAmount / entryPrice;

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
    Kafka.sendToConsumer(
      currencyPair,
      "orders-detail",
      JSON.stringify(buyOrder),
    );
    const responseData = {
      asset: walletDB?.asset || "",
      balance: walletDB?.balance?.toString() || "0",
    };
    //push to redis
    await Promise.all([
      Redis.getClient().hSet(`orderdetail:orderID:${uuid}`, buyOrder),
      Redis.getClient().expire(`orderdetail:orderID:${uuid}`, 5000),
      Redis.getClient().sAdd(`openOrders:userId${userId}`, uuid),
      Redis.getClient().hSet(redisKey, responseData),
      Redis.getClient().expire(redisKey, 5000),
    ]);
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
