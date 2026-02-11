import {
  Wallet,
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
  AuthRequest,
  Response,
  Redis,
} from "./export";

export const getUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    // const userid = req.user?._id;
    // if (!userid) {
    //   throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "UNAUTHORIZED");
    // }
    const userid = "696f330085f796568d1339ea";
    const asset = req.params.asset;
    const redisKey = `wallet:${userid}:${asset}:balance`;
    // console.time("redis cache");
    const cached = await Redis.getClient().get(redisKey);
    // console.timeEnd("redis cache");
    if (cached) {
      return res
        .status(200)
        .json(new ApiResponse(200, cached, "wallet balance (cache)"));
    }

    const wallet = await Wallet.findOne({ user: userid, asset }).lean();
    if (!wallet) {
      throw new ApiErrorHandling(HttpCodes.NOT_FOUND, "Wallet not found");
    }

    const walletBalance = wallet.balance;
    // push to redis
    await Redis.getClient().set(redisKey, walletBalance);

    return res
      .status(HttpCodes.OK)
      .json(
        new ApiResponse(
          HttpCodes.OK,
          { walletBalance },
          "user updated balance",
        ),
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
