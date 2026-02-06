"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPosition = void 0;
const export_1 = require("../orders-controllers/export");
const openPosition = async (_req, res) => {
    try {
        // const userId = req.user?._id;
        // if (!userId) {
        //   throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "Unauthorized");
        // }
        const redis = export_1.Redis.getClient();
        const orderIds = await redis.zRange("openOrders:user:696f330085f796568d1339ea", 0, 5);
        if (orderIds.length) {
            const result = await Promise.all(orderIds.map(async (Id) => {
                return await redis.hmGet(`orderdetail:orderID:${Id}`, [
                    "orderId",
                    "orderSide",
                    "orderQuantity",
                    "entryPrice",
                    "positionStatus",
                ]);
            }));
            return res
                .status(export_1.HttpCodes.OK)
                .json(new export_1.ApiResponse(export_1.HttpCodes.OK, result, "Live trades from redis"));
        }
        const orders = await export_1.Order.find({
            user: "696f330085f796568d1339ea",
            positionStatus: "Open",
        })
            .sort({
            createdAt: -1,
        })
            .lean();
        //push to Redis
        const pipeline = redis.multi();
        orders.forEach(async (order) => {
            const orderId = order.orderId;
            await Promise.all([
                pipeline.hSet(`orderdetail:orderID:${orderId}`, {
                    orderId: order.orderId,
                    userId: order.user.toString(),
                    currencyPair: order.currencyPair,
                    orderSide: order.orderSide,
                    orderType: order.orderType,
                    entryPrice: order.entryPrice.toString(),
                    orderAmount: order.orderAmount.toString(),
                    orderQuantity: order.orderQuantity.toString(),
                    positionStatus: order.positionStatus,
                }),
                pipeline.expire(`orderdetail:orderID:${orderId}`, 300),
                pipeline.zAdd(`openOrders:user:${order.user}`, {
                    score: Number(order.createdAt?.getTime()),
                    value: order.orderId,
                }),
                pipeline.expire(`openOrders:user:${order.user}`, 300),
            ]);
        });
        await pipeline.exec();
        return res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, orders, "Live from DB trades"));
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
exports.openPosition = openPosition;
//# sourceMappingURL=order-open-controller.js.map