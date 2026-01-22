import { Response } from "express";
import { Order } from "./order-model";
import { Wallet } from "../wallet-services/wallet-model";
import {
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
} from "../../utils/utils-export";
import { AuthRequest } from "../../middleware/jwt-verify";
import crypto from "node:crypto";
import kafkaProducer from "../kafka-services/kafka-producer";

interface ISellRequestBody {
  currencyPair: string;
  orderType: "market" | "limit";
  entryPrice: number;
  positionStatus: "closed";
  orderQuantity: number; // token quantity
}

const buyOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      currencyPair,
      orderSide,
      orderType,
      entryPrice,
      positionStatus,
      orderAmount,
    }: IBuyRequestBody = req.body;

    const uuid = crypto.randomUUID();
    console.log(uuid);

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

    const order = {
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

    await kafkaProducer.sendToConsumer("orders", JSON.stringify(order));

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
      .json(new ApiResponse(HttpCodes.OK, order, "Trade placed successfully"));
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
    const {
      currencyPair,
      orderType,
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

    const order = await Order.create({
      user: userId,
      currencyPair,
      orderType,
      entryPrice,
      positionStatus,
      orderQuantity,
      orderAmount: totalAmount,
    });

    // Wallet update
    token.balance -= orderQuantity;
    usdt.balance += totalAmount;

    await wallet.save();

    return res
      .status(HttpCodes.OK)
      .json(new ApiResponse(HttpCodes.OK, order, "Sell order executed"));
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

    const trades = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res
      .status(HttpCodes.OK)
      .json(new ApiResponse(HttpCodes.OK, trades, "Live trades"));
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
