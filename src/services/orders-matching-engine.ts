import { Redis } from "../config/redis-config/redis-connection";
import { IOrder } from "./order-services/order-model";

export const orderMatchingEngine = async (message: IOrder) => {
  // for buy order
  const {
    currencyPair,
    orderSide,
    orderAmount,
    orderQuantity,
    orderId,
    entryPrice,
  } = message;
  let userQty = orderQuantity;
  const userOrderId = orderId;

  await Redis.getClient().zAdd(
    `orderbook:${currencyPair}:${orderId}:${orderSide}`,
    [{ score: orderAmount, value: `${currencyPair}|${orderQuantity}` }],
  );

  const key =
    orderSide === "BUY"
      ? `orderbook:${currencyPair}:SELL`
      : `orderbook:${currencyPair}:BUY`;

  const trades = [];

  while (userQty > 0) {
    const order =
      orderSide === "BUY"
        ? await Redis.getClient().zRange(key, 0, 0)
        : await Redis.getClient().zRange(key, 0, 0, { REV: true });

    if (order?.length === 0) break;

    const [orderId, orderQuantity] = order[0].split("|");

    const counterQty = Number(orderQuantity);
    const counterOrderId = Number(orderId);

    const bestPrice = Number(Redis.getClient().zScore(key, order[0])); //seller price due to buy order

    // Price check
    if (
      (orderSide === "BUY" && bestPrice > entryPrice) ||
      (orderSide === "SELL" && bestPrice < entryPrice)
    ) {
      break;
    }
    const tradeQty = Math.min(userQty, counterQty);

    userQty -= tradeQty;

    await Redis.getClient().zRem(key, order[0]);

    const newQty = counterQty - tradeQty;

    if (newQty > 0) {
      await Redis.getClient().zAdd(key, {
        score: bestPrice,
        value: `${orderId}|${newQty}`,
      });
    }

    const trade = {
      symbol: currencyPair,
      bestPrice,
      quantity: tradeQty,
      buyOrderId: orderSide === "BUY" ? userOrderId : counterOrderId,
      sellOrderId: orderSide === "SELL" ? userOrderId : counterOrderId,
    };

    trades.push(trade);
  }

  return trades;
};
