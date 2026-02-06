"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBalance = void 0;
const export_1 = require("./export");
const updateUserBalance = async (req, res) => {
    try {
        const userid = req.user?._id;
        const balance = 10000;
        if (!userid) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "Unauthorized");
        }
        //check if balance is full or not
        const wallet = await export_1.Wallet.findOne({ user: userid });
        if (!wallet || null) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.NOT_FOUND, "Wallet not found. Create wallet first");
        }
        if (!(wallet.balance < balance)) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.BAD_REQUEST, "wallet already fill");
        }
        //update wallet balance
        const user = await export_1.Wallet.findOneAndUpdate({ user: userid }, {
            balance: balance,
        }, { new: true });
        res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, { user }, "user balance updated successfully"));
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
exports.updateUserBalance = updateUserBalance;
//# sourceMappingURL=update-user-balance.js.map