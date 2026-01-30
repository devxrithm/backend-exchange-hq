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
import { v4 as uuidv4 } from "uuid";

export const sellOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const uuid = uuidv4();
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
    const totalAmount = orderQuantity * entryPrice;

    const redisKey = `wallet:${userId}:${currencyPair}:balance`;
    const wallet = await Redis.getClient().get(redisKey);

    let walletBalance = Number(wallet);

    if (walletBalance === 0) {
      //fetch from DB
      const walletDB = await Wallet.findOne({
        user: userId,
        asset: currencyPair,
      });
      if (!walletDB) {
        throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "wallet not created");
      }
      //push to redis
      walletBalance = Number(walletDB.balance);
      //push cached wallet to redis
      await Redis.getClient().set(redisKey, walletBalance);
    }
   
    if (orderQuantity > walletBalance) {
      throw new ApiErrorHandling(
        HttpCodes.BAD_REQUEST,
        "Insufficient Token balance",
      );
    }
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

    //push to kafka
    Kafka.sendToConsumer(
      currencyPair,
      "orders-detail",
      JSON.stringify(sellOrder),
    );

    //push to redis
    const pipeline = Redis.getClient().multi();
    pipeline.hSetEx(`orderdetail:orderID:${uuid}`, sellOrder, {
      expiration: {
        type: "EX",
        value: 5000,
      },
    });
    pipeline.sAdd(`openOrders:userId${userId}`, uuid);
    await pipeline.exec();

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
