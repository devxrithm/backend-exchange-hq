"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyOrder = void 0;
const export_1 = require("./export");
const uuid_1 = require("uuid");
const buyOrder = async (req, res) => {
    try {
        const uuid = (0, uuid_1.v4)();
        const { currencyPair, orderSide, orderType, entryPrice, positionStatus, orderAmount, } = req.body;
        //fetch userid from middleware
        // const userId = req.user?._id;
        const userId = "696f330085f796568d1339ea";
        if (!userId) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.UNAUTHORIZED, "User not authenticated");
        }
        //calculate qty so that it can use as globally
        const orderQuantity = orderAmount / entryPrice;
        const redisKey = `wallet:${userId}:USDT:balance`;
        //console.time("redis-get-wallet");
        const wallet = await export_1.Redis.getClient().get(redisKey);
        //console.timeEnd("redis-get-wallet");
        let walletBalance = Number(wallet);
        if (walletBalance === 0) {
            const walletDB = await export_1.Wallet.findOne({
                user: userId,
                asset: "USDT",
            }).lean();
            if (!walletDB) {
                throw new export_1.ApiErrorHandling(export_1.HttpCodes.BAD_REQUEST, "wallet not created");
            }
            walletBalance = Number(walletDB.balance);
            //push cached wallet to redis
            //console.time("redis-set-wallet");
            await export_1.Redis.getClient().set(redisKey, walletBalance);
            //console.timeEnd("redis-set-wallet");
        }
        if (orderAmount > walletBalance) {
            throw new export_1.ApiErrorHandling(export_1.HttpCodes.BAD_REQUEST, "Insufficient USDT balance");
        }
        const buyOrder = {
            user: userId.toString(),
            orderId: uuid,
            orderSide,
            currencyPair: currencyPair,
            orderType,
            entryPrice: entryPrice.toString(),
            positionStatus,
            orderAmount: orderAmount.toString(),
            orderQuantity: orderQuantity.toString(),
        };
        //push to kafka
        //console.time("kafka-send");
        export_1.Kafka.sendToConsumer(currencyPair, "orders-detail", JSON.stringify(buyOrder));
        //console.timeEnd("kafka-send");
        //push to redis
        //console.time("redis-pipeline");
        const pipeline = export_1.Redis.getClient().multi();
        pipeline.hSet(`orderdetail:orderID:${uuid}`, buyOrder);
        pipeline.expire(`orderdetail:orderID:${uuid}`, 5000); //set expiry of 5000 seconds
        pipeline.sAdd(`openOrders:userId:${userId}`, uuid);
        await pipeline.exec();
        //console.timeEnd("redis-pipeline");
        return res
            .status(export_1.HttpCodes.OK)
            .json(new export_1.ApiResponse(export_1.HttpCodes.OK, buyOrder, "Trade placed successfully"));
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
exports.buyOrder = buyOrder;
//# sourceMappingURL=order-buy-controller.js.map