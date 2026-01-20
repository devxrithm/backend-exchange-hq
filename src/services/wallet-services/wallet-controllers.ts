import { Wallet } from "./wallet-model";
import {
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
} from "../../utils/utils-export";
import { Response } from "express";
import { AuthRequest } from "../../middleware/jwt-verify";

const updateUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userid = req.user?._id;
    const balance = 10000;
    if (!userid) {
      throw new ApiErrorHandling(
        401,
        "something went wrong while updating balance"
      );
    }
    //check if balance is full or not
    const wallet = await Wallet.findOne({ user: userid });

    if (!wallet || null) {
      throw new ApiErrorHandling(
        401,
        "kindly create wallet first before updating balance"
      );
    }

    if (!(wallet.currencyAmount[0].balance < balance)) {
      throw new ApiErrorHandling(401, "wallet already fill");
    }
    //update wallet balance
    const user = await Wallet.findOneAndUpdate(
      { user: userid },
      {
        currencyAmount: {
          balance: balance,
        },
      },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, { user }, "user balance updated successfully")
      );
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            HttpCodes.INTERNAL_SERVER_ERROR,
            null,
            "Internal Server Error"
          )
        );
    }
  }
};

const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userid = req.user?._id;
    if (!userid) {
      throw new ApiErrorHandling(
        401,
        "something went wrong while creating wallet"
      );
    }

    const existingWallet = await Wallet.findOne({ user: userid });
    console.log(existingWallet);
    if (existingWallet) {
      throw new ApiErrorHandling(401, "wallet already exist");
    }

    const userWallet = await Wallet.create({
      user: userid,
      currencyAmount: [
        { currency: "usdt", balance: 10000 }, // default USDT wallet
      ],
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, { userWallet }, "wallet created successfully")
      );
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            HttpCodes.INTERNAL_SERVER_ERROR,
            null,
            "Internal Server Error"
          )
        );
    }
  }
};

const getUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userid = req.user?._id;
    const user = await Wallet.findOne({ user: userid });
    if (!user) {
      throw new ApiErrorHandling(401, "something went wrong");
    }
    const currBalance = user.currencyAmount;
    res
      .status(200)
      .json(new ApiResponse(200, { currBalance }, "user updated balance"));
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            HttpCodes.INTERNAL_SERVER_ERROR,
            null,
            "Internal Server Error"
          )
        );
    }
  }
};

export { getUserBalance, updateUserBalance, createWallet };
