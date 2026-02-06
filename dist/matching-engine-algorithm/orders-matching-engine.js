"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderMatchingEngine = void 0;
const redis_connection_1 = require("../config/redis-config/redis-connection");
const orderMatchingEngine = async (message) => {
    // for buy order
    const { user, currencyPair, orderSide, orderQuantity, orderId, entryPrice } = message;
    const id = user;
    let userQty = Number(orderQuantity);
    const userOrderId = orderId;
    const buyBook = `orderbook:${currencyPair}:BUY`;
    const sellBook = `orderbook:${currencyPair}:SELL`;
    const userBook = orderSide === "BUY" ? buyBook : sellBook;
    const oppositeBook = orderSide === "BUY" ? sellBook : buyBook;
    const trades = [];
    while (userQty > 0) {
        const order = orderSide === "BUY"
            ? await redis_connection_1.Redis.getClient().zPopMin(oppositeBook)
            : await redis_connection_1.Redis.getClient().zPopMax(oppositeBook);
        if (!order)
            break;
        const { value, score } = order;
        const [counterUserId, counterOrderIdStr, counterQtyStr] = value.split("|");
        const counterOrderId = String(counterOrderIdStr);
        const counterQty = Number(counterQtyStr);
        const bestPrice = Number(score);
        // Price check
        if ((orderSide === "BUY" && bestPrice > Number(entryPrice)) ||
            (orderSide === "SELL" && bestPrice < Number(entryPrice))) {
            break;
        }
        const tradedQuantity = Math.min(userQty, counterQty);
        userQty = userQty - tradedQuantity;
        //removed resting order here
        await redis_connection_1.Redis.getClient().zRem(oppositeBook, value);
        const newQty = counterQty - tradedQuantity;
        if (newQty > 0) {
            await redis_connection_1.Redis.getClient().zAdd(oppositeBook, {
                score: bestPrice,
                value: `${counterOrderId}|${newQty}`,
            });
        }
        const trade = {
            currencyPair,
            buyerUserId: orderSide === "BUY" ? id : counterUserId,
            sellerUserId: orderSide === "SELL" ? id : counterUserId,
            buyerOrderId: orderSide === "BUY" ? userOrderId : counterOrderId,
            sellerOrderId: orderSide === "SELL" ? userOrderId : counterOrderId,
            tradedQuantity,
            executionPrice: bestPrice,
            orderAmount: tradedQuantity * bestPrice,
            status: userQty === 0 ? "Filled" : "Partially Filled",
        };
        trades.push(trade);
    }
    //only saved for resting order here
    if (userQty > 0) {
        await redis_connection_1.Redis.getClient().zAdd(userBook, {
            score: entryPrice,
            value: `${id}|${userOrderId}|${userQty}`,
        });
    }
    return trades;
};
exports.orderMatchingEngine = orderMatchingEngine;
//# sourceMappingURL=orders-matching-engine.js.map