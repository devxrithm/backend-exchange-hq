import { Order } from "./order-model";
import { ApiErrorHandling, ApiResponse } from "../../utils/utils-export.js";
import { Wallet } from "../wallet-services/wallet-model.js";
import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/jwt-verify";

const buy = async (
  req:
    | AuthRequest
    | Request<
        {},
        {},
        {
          currencyPair: string;
          orderType: string;
          entryPrice: number;
          positionStatus: string;
          orderAmount: number;
          pnl: number;
        }
      >,
  res: Response,
) => {
  const {
    currencyPair,
    orderType,
    entryPrice,
    positionStatus,
    orderAmount,
    pnl,
  } = req.body;
  const userId = req.user?._id;

  try {
    if (!userId) throw new ApiErrorHandling(401, "User not authenticated");

    // Fetch user wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet)
      throw new ApiErrorHandling(
        404,
        "Wallet not found. Please create wallet first.",
      );

    // Find USDT balance
    const usdtAmount = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === "usdt",
    );
    if (!usdtAmount)
      throw new ApiErrorHandling(404, "USDT balance not found in wallet");

    if (totalAmount > usdtAmount.balance)
      throw new ApiErrorHandling(401, "Insufficient USDT balance");

    // Calculate token quantity
    const calculatedQuantity = totalAmount / entryPrice;

    // Create order
    const order = await Order.create({
      user: userId,
      currencyPair,
      quantity: calculatedQuantity,
      tradeType,
      entryPrice,
      positionStatus,
      totalAmount,
      pnl,
    });

    // Deduct USDT from wallet
    usdtAmount.balance -= totalAmount;

    // Add token to wallet (or create if not exists)
    let tokenAmount = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === currencyPair.toLowerCase(),
    );
    if (tokenAmount) {
      tokenAmount.balance += calculatedQuantity;
    } else {
      wallet.currencyAmount.push({
        currency: currencyPair,
        balance: calculatedQuantity,
      });
    }

    await wallet.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, order._id.toString(), "Trade placed successfully"),
      );
  } catch (error) {
    console.error("BUY ERROR:", error.message);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Something went wrong",
        ),
      );
  }
};

const sell = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      currencyPair,
      tradeType,
      entryPrice,
      positionStatus,
      totalAmount,
      pnl,
      quantity,
    } = req.body;
    if (!userId) throw new ApiErrorHandling(401, "User not authenticated");

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet)
      throw new ApiErrorHandling(
        404,
        "Wallet not found. Please create wallet first.",
      );

    // Find tokenQuantity balance
    const tokenQuantity = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === currencyPair.toLowerCase(),
    );

    if (!tokenQuantity)
      throw new ApiErrorHandling(404, "USDT balance not found in wallet");

    if (totalAmount > tokenQuantity.balance)
      throw new ApiErrorHandling(401, "Insufficient Quantity balance");

    const order = await Order.create({
      user: userId,
      quantity,
      currencyPair,
      tradeType,
      entryPrice,
      positionStatus,
      totalAmount,
      pnl,
    });

    usdtAmount.balance += totalAmount;

    // Add token to wallet (or create if not exists)
    let tokenAmount = wallet.currencyAmount.find(
      (c) => c.currency.toLowerCase() === currencyPair.toLowerCase(),
    );
    if (tokenAmount) {
      tokenAmount.balance -= calculatedQuantity;
    } else {
      wallet.currencyAmount.push({
        currency: currencyPair,
        balance: calculatedQuantity,
      });
    }

    await wallet.save();
    res.status(200).json(new ApiResponse(200, null, "success"));
  } catch (error) {}
};

const position = async (req, res) => {
  try {
    const userId = req.user?._id;
    const fetchTrades = await Order.find({ user: userId });
    if (!fetchTrades) {
      throw new ApiErrorHandling(401, "Order Not Found");
    }
    res.status(200).json(new ApiResponse(200, fetchTrades, "live Trades"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, "something went wrong"));
  }
};

export { buy, sell, position };
