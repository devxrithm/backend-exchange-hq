import {
  ApiErrorHandling,
  AuthRequest,
  HttpCodes,
  IBuyRequestBody,
  Response,
  Redis,
  ApiResponse,
  Kafka,
} from "./orders-controller";
import crypto from "node:crypto";

export const buyOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const uuid = crypto.randomUUID();
    const {
      currencyPair,
      orderSide,
      orderType,
      entryPrice,
      positionStatus,
      orderAmount,
    }: IBuyRequestBody = req.body;
    //fetch userid from middleware
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiErrorHandling(
        HttpCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }
    //db call

    const redisKey = `wallet:${userId}:usdt`;
    const wallet = await Redis.getClient().hmGet(redisKey, [
      "asset",
      "balance",
    ]);
    const walletBalance = wallet[1];
    if (wallet) {
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
        currencyPair,
        orderType,
        entryPrice: entryPrice.toString(),
        positionStatus,
        orderAmount: orderAmount.toString(),
        orderQuantity: orderQuantity.toString(),
      };
      //push to kafka
      await Kafka.sendToConsumer("orders-detail", JSON.stringify(buyOrder));

      //push to redis
      Redis.getClient()
        .multi()
        .hSet(`orderID:${uuid}`, buyOrder)
        .expire(`orderID:${uuid}`, 60)
        .sAdd(`user:openOrders:${userId}`, uuid)
        .exec();
    }
    // const walletFromDb = await Wallet.findOne({ user: userId, asset: "usdt" });
    // Wallet update
    // wallet.balance -= orderAmount;

    // const walletToken = await Wallet.findOne({
    //   user: userId,
    //   asset: currencyPair,
    // });
    // if (!walletToken) {
    //   await Wallet.create({
    //     user: userId,
    //     asset: currencyPair,
    //     balance: orderQuantity,
    //   });
    // } else {
    //   walletToken.balance += orderQuantity;
    // }

    // await wallet.save();

    return res
      .status(HttpCodes.OK)
      .json(
        new ApiResponse(HttpCodes.OK, buyOrder, "Trade placed successfully"),
      );
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
