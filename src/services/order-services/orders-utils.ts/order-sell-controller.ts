import redisConnection from "../../../config/redis-config/redis-connection";
import kafkaProducer from "../../kafka-services/kafka-producer";
import {
  ApiErrorHandling,
  ApiResponse,
  AuthRequest,
  HttpCodes,
  ISellRequestBody,
  Wallet,
  Response,
} from "../orders-controller";
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

    const userId = req.user?._id;
    if (!userId) {
      throw new ApiErrorHandling(
        HttpCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new ApiErrorHandling(HttpCodes.NOT_FOUND, "Wallet not found");
    }

    const token = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === currencyPair.toLowerCase(),
    );

    if (!token || token.balance < orderQuantity) {
      throw new ApiErrorHandling(
        HttpCodes.BAD_REQUEST,
        "Insufficient token balance",
      );
    }

    const usdt = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === "usdt",
    );
    if (!usdt) {
      throw new ApiErrorHandling(HttpCodes.NOT_FOUND, "USDT wallet missing");
    }

    const totalAmount = orderQuantity * entryPrice;

    const sellOrder = {
      user: userId,
      orderId: uuid,
      currencyPair,
      orderSide,
      orderType,
      entryPrice,
      positionStatus,
      orderQuantity,
      orderAmount: totalAmount,
    };

    //push to kafka
    await kafkaProducer.sendToConsumer(
      "orders-detail",
      JSON.stringify(sellOrder),
    );

    await redisConnection
      .getClient()
      ?.json.set(`orderID:${uuid}`, "$", sellOrder);
    console.log("order saved to redis");

    await redisConnection.getClient()?.sAdd(`userOrders:${userId}`, uuid);
    // Wallet update
    token.balance -= orderQuantity;
    usdt.balance += totalAmount;

    await wallet.save();

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
