import {
  ApiErrorHandling,
  ApiResponse,
  AuthRequest,
  HttpCodes,
  ISellRequestBody,
  Wallet,
  Response,
  Kafka,
  Redis,
} from "./orders-controller";
import crypto from "node:crypto";

export const sellOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const uuid = crypto.randomUUID();
    const {
      currencyPair,
      orderType,
      orderSide,
      entryPrice,
      positionStatus,
      orderQuantity,
    }: ISellRequestBody = req.body;
    // const asset = req.params.asset;
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiErrorHandling(
        HttpCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }
    const redisKey = `wallet:${userId}:${currencyPair}`;
    const wallet = await Redis.getClient().hmGet(redisKey, [
      "asset",
      "balance",
    ]);
    console.log(wallet, wallet[1] != null);
    if (wallet[1] != null) {
      const walletBalance = wallet[1];
      if (orderQuantity > Number(walletBalance)) {
        throw new ApiErrorHandling(
          HttpCodes.BAD_REQUEST,
          "Insufficient Quantity balance",
        );
      }

      const totalAmount = orderQuantity * entryPrice;

      const sellOrder = {
        user: userId.toString(),
        orderId: uuid,
        orderSide,
        currencyPair: currencyPair,
        orderType,
        entryPrice: entryPrice.toString(),
        positionStatus,
        orderAmount: totalAmount.toString(),
        orderQuantity: orderQuantity.toString(),
      };

      console.log("push to kafka");
      //push to kafka
      await Kafka.sendToConsumer("orders-detail", JSON.stringify(sellOrder));

      //push to redis
      Redis.getClient()
        .multi()
        .hSet(`orderdetail:orderID:${uuid}`, sellOrder)
        .expire(`orderdetail:orderID:${uuid}`, 5000)
        .sAdd(`openOrders:userId:${userId}`, uuid)
        .exec();
    }

    //fetch from DB
    const walletDB = await Wallet.findOne({
      user: userId,
      asset: currencyPair,
    });
    if (!walletDB) {
      throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "wallet not created");
    }
    const totalAmount = orderQuantity * entryPrice;

    const sellOrder = {
      user: userId.toString(),
      orderId: uuid,
      orderSide,
      currencyPair: currencyPair,
      orderType,
      entryPrice: entryPrice.toString(),
      positionStatus,
      orderAmount: totalAmount.toString(),
      orderQuantity: orderQuantity.toString(),
    };

    console.log("push to kafka");
    //push to kafka
    await Kafka.sendToConsumer("orders-detail", JSON.stringify(sellOrder));

    //push to redis
    Redis.getClient()
      .multi()
      .hSet(`orderdetail:orderID:${uuid}`, sellOrder)
      .expire(`orderdetail:orderID:${uuid}`, 5000)
      .sAdd(`openOrders:userId:${userId}`, uuid)
      .exec();

    const responseData = {
      asset: walletDB?.asset || "",
      balance: walletDB?.balance?.toString() || "0",
    };
    // push to redis
    await Promise.all([
      Redis.getClient().hSet(redisKey, responseData),
      Redis.getClient().expire(redisKey, 5000),
    ]);

    return res
      .status(HttpCodes.OK)
      .json(new ApiResponse(HttpCodes.OK, sellOrder, "Sell order executed"));
  } catch (error) {
    console.log(error);
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
