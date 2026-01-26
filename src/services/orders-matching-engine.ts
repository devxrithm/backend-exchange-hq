import { Redis } from "../config/redis-config/redis-connection";

export const orderMatchingEngine = async (message) => {
  const { currencyPair, orderSide, orderAmount,orderQuantity} = message;
  await Redis.getClient().zAdd(`orderbook:${currencyPair}:${orderSide}`, [
    { score: orderAmount, value: currencyPair },
  ]);

  while (orderQuantity > 0) {
    const prices = orderSide === "BUY"
      ? await Redis.getClient().zRange(`orderbook:${currencyPair}:${orderSide}`, 0, 0)
      : await Redis.getClient().zRange(`orderbook:${currencyPair}:${orderSide}`, 0, 0,{ REV: true });

    if (prices?.length === 0) break;

    const bestPrice = Number(prices[0]);

    // Price check
    if (
      (orderSide.side === "BUY" && bestPrice > orderSide.price) ||
      (orderSide.side === "SELL" && bestPrice < orderSide.price)
    ) {
      break;
    }

     await Redis.getClient().zRem(`orderbook:${currencyPair}:${orderSide}`, bestPrice.toString());
     

    const maker = await redis.hGetAll(`order:${makerOrderId}`);
    const makerRemaining = Number(maker.remaining);

    const tradeQty = Math.min(remaining, makerRemaining);

    // Update maker
    await redis.hIncrByFloat(
      `order:${makerOrderId}`,
      "remaining",
      -tradeQty
    );

    remaining -= tradeQty;

    if (makerRemaining > tradeQty) {
      await redis.lPush(levelKey, makerOrderId);
    } else {
      await redis.hSet(`order:${makerOrderId}`, {
        status: "FILLED"
      });
    }

    // 🔔 Emit trade event (Kafka / WS)
    console.log("TRADE", {
      price: bestPrice,
      qty: tradeQty,
      maker: makerOrderId
    });
  }

  return remaining;
}
};
