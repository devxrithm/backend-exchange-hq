"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderHistoryController = void 0;
const export_1 = require("../place-orders/orders-controllers/export");
const order_history_model_1 = require("./order-history-model");
const orderHistoryController = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "User not authenticated");
        }
        const result = await order_history_model_1.orderHistory.find({
            $or: [{ buyerUserId: userId }, { sellerUserId: userId }],
        });
        return res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, result, "Order history fetched successfully"));
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
exports.orderHistoryController = orderHistoryController;
//# sourceMappingURL=order-history-controller.js.map