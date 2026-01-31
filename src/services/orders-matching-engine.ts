import { Redis } from "../config/redis-config/redis-connection";
import { IOrder } from "./order-services/place-orders/order-model";

export const orderMatchingEngine = async (message: IOrder) => {
  // for buy order
  const { user, currencyPair, orderSide, orderQuantity, orderId, entryPrice } =
    message;
  const id = user;
  let userQty = Number(orderQuantity);
  const userOrderId = orderId;

  const buyBook = `orderbook:${currencyPair}:BUY`;
  const sellBook = `orderbook:${currencyPair}:SELL`;

  const userBook = orderSide === "BUY" ? buyBook : sellBook;
  const oppositeBook = orderSide === "BUY" ? sellBook : buyBook;

  const trades = [];

  while (userQty > 0) {
    const order =
      orderSide === "BUY"
        ? await Redis.getClient().zRange(oppositeBook, 0, 0)
        : await Redis.getClient().zRange(oppositeBook, 0, 0, { REV: true });

    if (order?.length === 0) break;

    const [counterUserId, counterOrderIdStr, counterQtyStr] =
      order[0].split("|");
    const counterOrderId = String(counterOrderIdStr);
    const counterQty = Number(counterQtyStr);

    const bestPrice = Number(
      await Redis.getClient().zScore(oppositeBook, order[0]),
    );

    // Price check
    if (
      (orderSide === "BUY" && bestPrice > Number(entryPrice)) ||
      (orderSide === "SELL" && bestPrice < Number(entryPrice))
    ) {
      break;
    }
    const tradedQuantity = Math.min(userQty, counterQty);

    userQty = userQty - tradedQuantity; //if left, again added to redis

    //removed resting order here
    await Redis.getClient().zRem(oppositeBook, order[0]);

    const newQty = counterQty - tradedQuantity;

    if (newQty > 0) {
      await Redis.getClient().zAdd(oppositeBook, {
        score: bestPrice,
        value: `${counterOrderId}|${newQty}`,
      });
    }

    const trade = {
      buyerUserId: orderSide === "BUY" ? id : counterUserId,
      sellerUserId: orderSide === "SELL" ? id : counterUserId,
      buyerOrderId: orderSide === "BUY" ? userOrderId : counterOrderId,
      sellerOrderId: orderSide === "SELL" ? userOrderId : counterOrderId,
      tradedQuantity,
      executionPrice: bestPrice,
      orderAmount: tradedQuantity * bestPrice,
      status: newQty === 0 ? "Filled" : "Partially Filled",
      buyerRealizedPnL: (bestPrice - entryPrice) * tradedQuantity,
      sellerRealizedPnL: (entryPrice - bestPrice) * tradedQuantity,
    };

    trades.push(trade);
  }

  //only saved for resting order here
  if (userQty > 0) {
    await Redis.getClient().zAdd(userBook, {
      score: entryPrice,
      value: `${id}|${userOrderId}|${userQty}`,
    });
  }
  return trades;
};
