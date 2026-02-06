"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellOrder = void 0;
const export_1 = require("./export");
const uuid_1 = require("uuid");
const sellOrder = async (req, res) => {
    try {
        const uuid = (0, uuid_1.v4)();
        const { currencyPair, orderType, orderSide, entryPrice, positionStatus, orderQuantity, } = req.body;
        // const asset = req.params.asset;
        // const userId = req.user?._id;
        const userId = "697735168a96610da52cf73e";
        if (!userId) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "User not authenticated");
        }
        const totalAmount = orderQuantity * entryPrice;
        const redisKey = `wallet:${userId}:ETHUSDT:balance`;
        const wallet = await export_1.Redis.getClient().get(redisKey);
        let walletBalance = Number(wallet);
        if (walletBalance === 0) {
            //fetch from DB
            // console.time("db-fetch");
            const walletDB = await export_1.Wallet.findOne({
                user: userId,
                asset: currencyPair,
            }).lean();
            // console.timeEnd("db-fetch");
            if (!walletDB) {
                throw new export_1.ApiErrorHandling(export_1.HttpCodes.BAD_REQUEST, "wallet not created");
            }
            //push to redis
            walletBalance = Number(walletDB.balance);
            //push cached wallet to redis
            await export_1.Redis.getClient().set(redisKey, walletBalance);
        }
        if (orderQuantity > walletBalance) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.BAD_REQUEST, "Insufficient Token balance");
        }
        const sellOrder = {
            user: userId.toString(),
            orderId: uuid,
            orderSide,
            currencyPair: currencyPair,
            orderType,
            entryPrice: entryPrice.toString(),
            positionStatus,
            orderAmount: totalAmount.toString(),
            orderQuantity: orderQuantity.toString(),
        };
        //push to kafka
        export_1.Kafka.sendToConsumer(currencyPair, "orders-detail", JSON.stringify(sellOrder));
        //push to redis
        const pipeline = export_1.Redis.getClient().multi();
        pipeline.hSet(`orderdetail:orderID:${uuid}`, sellOrder);
        pipeline.expire(`orderdetail:orderID:${uuid}`, 5000);
        pipeline.sAdd(`openOrders:userId${userId}`, uuid);
        await pipeline.exec();
        return res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, sellOrder, "Sell order executed"));
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
exports.sellOrder = sellOrder;
//# sourceMappingURL=order-sell-controller.js.map