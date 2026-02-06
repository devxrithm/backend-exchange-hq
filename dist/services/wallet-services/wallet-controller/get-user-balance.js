"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBalance = void 0;
const export_1 = require("./export");
const getUserBalance = async (req, res) => {
    try {
        // const userid = req.user?._id;
        const userid = "696f330085f796568d1339ea";
        if (!userid) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "UNAUTHORIZED");
        }
        const asset = req.params.asset;
        const redisKey = `wallet:${userid}:${asset}:balance`;
        // console.time("redis cache");
        const cached = await export_1.Redis.getClient().get(redisKey);
        // console.timeEnd("redis cache");
        if (cached) {
            return res
                .status(200)
                .json(new export_1.ApiResponse(200, cached, "wallet balance (cache)"));
        }
        const wallet = await export_1.Wallet.findOne({ user: userid, asset }).lean();
        if (!wallet) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.NOT_FOUND, "Wallet not found");
        }
        const walletBalance = wallet.balance;
        // push to redis
        await export_1.Redis.getClient().set(redisKey, walletBalance);
        return res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, { walletBalance }, "user updated balance"));
    }
    catch (error) {
        if (error instanceof export_1.ApiErrorHandling) {
            return res
                .status(error.statusCode)
                .json(new export_1.ApiResponse(error.statusCode, null, error.message));
        }
        else {
            return res
                .status(export_1.HttpCodes.INTERNAL_SERVER_ERROR)
                .json(new export_1.ApiResponse(export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error"));
        }
    }
};
exports.getUserBalance = getUserBalance;
//# sourceMappingURL=get-user-balance.js.map