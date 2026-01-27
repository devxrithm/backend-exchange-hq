import { Redis } from "../config/redis-config/redis-connection";
import { IOrder } from "./order-services/order-model";

export const orderMatchingEngine = async (message: IOrder) => {
  // for buy order
  const { currencyPair, orderSide, orderQuantity, orderId, entryPrice } =
    message;
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

    const [counterOrderIdStr, counterQtyStr] = order[0].split("|");
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
    const tradeQty = Math.min(userQty, counterQty);

    userQty = userQty - tradeQty; //if left again added to redis
    console.log(userQty);

    //removed resting order here
    await Redis.getClient().zRem(oppositeBook, order[0]);

    const newQty = counterQty - tradeQty;

    if (newQty > 0) {
      await Redis.getClient().zAdd(oppositeBook, {
        score: bestPrice,
        value: `${counterOrderId}|${newQty}`,
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

  //only saved for resting order here
  if (userQty > 0) {
    await Redis.getClient().zAdd(userBook, {
      score: entryPrice,
      value: `${userOrderId}|${userQty}`,
    });
  }
  return trades;
};
