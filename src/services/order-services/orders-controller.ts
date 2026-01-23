import { Response } from "express";
// import { Order } from "./order-model";
import { Wallet } from "../wallet-services/wallet-model";
import {
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
} from "../../utils/utils-export";
import { AuthRequest } from "../../middleware/jwt-verify";
import crypto from "node:crypto";
import kafkaProducer from "../kafka-services/kafka-producer";
import redisConnection from "../../config/redis-config/redis-connection";

interface IBuyRequestBody {
  currencyPair: string;
  orderType: "market";
  entryPrice: number;
  positionStatus: "open" | "closed";
  orderAmount: number;
  orderSide: "BUY" | "SELL"; // USDT
}
interface ISellRequestBody extends IBuyRequestBody {
  orderQuantity: number;
}

const buyOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
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

    const usdt = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === "usdt",
    );

    if (!usdt) {
      throw new ApiErrorHandling(HttpCodes.NOT_FOUND, "USDT balance not found");
    }

    if (orderAmount > usdt.balance) {
      throw new ApiErrorHandling(
        HttpCodes.BAD_REQUEST,
        "Insufficient USDT balance",
      );
    }

    const orderQuantity = orderAmount / entryPrice;

    const buyOrder = {
      user: userId,
      orderId: uuid,
      orderSide,
      currencyPair,
      orderType,
      entryPrice,
      positionStatus,
      orderAmount,
      orderQuantity,
    };
    // const buyOrder = {
    //   user: userId.toString(),
    //   orderId: uuid,
    //   orderSide,
    //   currencyPair,
    //   orderType,
    //   entryPrice: entryPrice.toString(),
    //   positionStatus,
    //   orderAmount: orderAmount.toString(),
    //   orderQuantity: orderQuantity.toString(),
    // };
    //push to kafka
    await kafkaProducer.sendToConsumer(
      "orders-detail",
      JSON.stringify(buyOrder),
    );

    //push to redis
    await redisConnection
      .getClient()
      ?.json.set(`orderID:${uuid}`, "$", buyOrder);

    console.log("order saved to redis");
    await redisConnection.getClient()?.sAdd(`userOrders:${userId}`, uuid);

    // Wallet update
    usdt.balance -= orderAmount;

    const token = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === currencyPair.toLowerCase(),
    );

    if (token) {
      token.balance += orderQuantity;
    } else {
      wallet.currencyAmount.push({
        currency: currencyPair,
        balance: orderQuantity,
      });
    }

    await wallet.save();

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

const sellOrder = async (
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

const openPosition = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "Unauthorized");
    }

    // orderIds
    const orderIds = await redisConnection
      .getClient()
      .sMembers(`userOrders:${userId}`);
    console.log(orderIds);

    const orders = await Promise.all(
      orderIds.map(async (id) => {
        return redisConnection.getClient().json.get(`orderID:${id}`);
      }),
    );
    console.log(orders);
    // const trades = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res
      .status(HttpCodes.OK)
      .json(new ApiResponse(HttpCodes.OK, orders, "Live trades"));
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

export { buyOrder, sellOrder, openPosition };
