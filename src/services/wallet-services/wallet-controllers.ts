import { Wallet } from "./wallet-model";
import {
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
} from "../../utils/utils-export";
import { Response } from "express";
import { AuthRequest } from "../../middleware/jwt-verify";
import { Redis } from "../../config/redis-config/redis-connection";

const updateUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userid = req.user?._id;
    const balance = 10000;
    if (!userid) {
      throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "Unauthorized");
    }
    //check if balance is full or not
    const wallet = await Wallet.findOne({ user: userid });

    if (!wallet || null) {
      throw new ApiErrorHandling(
        HttpCodes.NOT_FOUND,
        "Wallet not found. Create wallet first",
      );
    }

    if (!(wallet.balance < balance)) {
      throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "wallet already fill");
    }
    //update wallet balance
    const user = await Wallet.findOneAndUpdate(
      { user: userid },
      {
        balance: balance,
      },
      { new: true },
    );

    res
      .status(HttpCodes.OK)
      .json(
        new ApiResponse(
          HttpCodes.OK,
          { user },
          "user balance updated successfully",
        ),
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
            "Internal Server Error",
          ),
        );
    }
  }
};

const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userid = req.user?._id;
    if (!userid) {
      throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "UNAUTHORIZED");
    }

    const existingWallet = await Wallet.findOne({ user: userid });
    console.log(existingWallet);
    if (existingWallet) {
      throw new ApiErrorHandling(HttpCodes.CONFLICT, "wallet already exist");
    }

    const userWallet = await Wallet.create({
      user: userid,
      asset: "USDT",
      balance: 10000,
    });

    res
      .status(HttpCodes.CREATED)
      .json(
        new ApiResponse(
          HttpCodes.CREATED,
          { userWallet },
          "wallet created successfully",
        ),
      );
  } catch (error) {
    console.log(error);
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
            "Internal Server Error",
          ),
        );
    }
  }
};

const getUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    // const userid = req.user?._id;
    const userid = "696f330085f796568d1339ea";
    if (!userid) {
      throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "UNAUTHORIZED");
    }

    const asset = req.params.asset;
    const redis = Redis.getClient();
    const redisKey = `wallet:${userid}:${asset}`;

    const cached = await redis.hmGet(redisKey, ["asset", "balance"]);
    if (cached[0]) {
      return res
        .status(200)
        .json(new ApiResponse(200, cached, "wallet balance (cache)"));
    }

    const wallet = await Wallet.findOne({ user: userid, asset });
    if (!wallet) {
      throw new ApiErrorHandling(HttpCodes.NOT_FOUND, "Wallet not found");
    }

    const responseData = {
      asset: wallet.asset,
      balance: wallet.balance.toString(),
    };

    // push to redis
    await Promise.all([
      Redis.getClient().hSet(redisKey, responseData),
      Redis.getClient().expire(redisKey, 600),
    ]);

    return res
      .status(HttpCodes.OK)
      .json(
        new ApiResponse(HttpCodes.OK, { responseData }, "user updated balance"),
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

export { getUserBalance, updateUserBalance, createWallet };
