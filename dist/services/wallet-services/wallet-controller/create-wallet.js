"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = void 0;
const export_1 = require("./export");
const createWallet = async (req, res) => {
    try {
        const userid = req.user?._id;
        if (!userid) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "UNAUTHORIZED");
        }
        const existingWallet = await export_1.Wallet.findOne({ user: userid });
        if (existingWallet) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.CONFLICT, "wallet already exist");
        }
        const userWallet = await export_1.Wallet.create({
            user: userid,
            asset: "USDT",
            balance: 10000,
        });
        res
            .status(export_1.HttpCodes.CREATED)
            .json(new export_1.ApiResponse(export_1.HttpCodes.CREATED, { userWallet }, "wallet created successfully"));
    }
    catch (error) {
        if (error instanceof export_1.ApiErrorHandling) {
            res
                .status(error.statusCode)
                .json(new export_1.ApiResponse(error.statusCode, null, error.message));
        }
        else {
            res
                .status(export_1.HttpCodes.INTERNAL_SERVER_ERROR)
                .json(new export_1.ApiResponse(export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error"));
        }
    }
};
exports.createWallet = createWallet;
//# sourceMappingURL=create-wallet.js.map