import { Redis } from "../../config/redis-config/redis-connection";
import { orderHistory } from "../order-services/order-history/order-history-model";
import { IOrder, Order } from "../order-services/place-orders/order-model";
import { orderMatchingEngine } from "../../matching-engine-algorithm/orders-matching-engine";
import { Wallet } from "../wallet-services/wallet-model";

let processing = false;

export const bulkInsertion = async (messages: IOrder[]) => {
  if (processing || messages.length === 0) return;
  processing = true;
  const batch = messages.splice(0, 1000);
  //Start at index 0 and Remove 1000 elements and finally Return those 1000 elements

  try {
    await Order.insertMany(batch, { ordered: false });
    //instead of one by one operation i used bulk operation here
    const walletOps = batch.map((order) => {
      if (order.orderSide === "BUY") {
        return {
          updateOne: {
            filter: { user: order.user, asset: "USDT" },
            update: { $inc: { balance: -order.orderAmount } },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { user: order.user, asset: order.currencyPair },
            update: { $inc: { balance: -order.orderQuantity } },
          },
        };
      }
    });
    //here walletops return an array of updateone operations
    await Wallet.bulkWrite(walletOps, { ordered: false }); //why i ordered false because if one operation fails other should continue

    //after, i updated wallet balance i need to clear redis cache
    const multi = Redis.getClient().multi();

    for (const order of batch) {
      multi.del(
        `openOrders:userId:${order.user}`
      );
      if (order.orderSide === "BUY") {
        multi.del(`wallet:${order.user}:USDT:balance`);
        // multi.del(`orderdetail:orderID:${orderId}`)
      } else {
        multi.del(`wallet:${order.user}:${order.currencyPair}:balance`);
      }
    }
    await multi.exec();

    //here we execute the engine in parallel
    // matching engine start here
    const tradeResults = await Promise.all(
      batch.map((order) => orderMatchingEngine(order)),
    );

    //here tradeResults is an array of arrays [[trade1, trade2], [trade3], n number of trades] so to convert it into a single array we use flat method here
    const allTrades = tradeResults.flat();
    if (allTrades.length === 0) {
      processing = false;
      return;
    }
    //push alltrades to orderHistory collection
    await orderHistory.insertMany(allTrades);

    //now after update order history we need to update order positionStatus in Order collection
    const orderStatusOps = [];

    for (const trade of allTrades) {
      orderStatusOps.push(
        {
          updateOne: {
            filter: { orderId: trade.buyerOrderId },
            update: { positionStatus: "Closed" },
          },
        },
        {
          updateOne: {
            filter: { orderId: trade.sellerOrderId },
            update: { positionStatus: "Closed" },
          },
        },
      );
    }

    await Order.bulkWrite(orderStatusOps, { ordered: false });

    const tradeWalletOps = [];

    for (const trade of allTrades) {
      tradeWalletOps.push({
        updateOne: {
          filter: { user: trade.buyerUserId, asset: trade.currencyPair },
          update: { $inc: { balance: trade.tradedQuantity } },
          upsert: true,
        },
      });
      tradeWalletOps.push({
        updateOne: {
          filter: { user: trade.sellerUserId, asset: "USDT" },
          update: {
            $inc: { balance: trade.tradedQuantity * trade.executionPrice },
          },
          upsert: true,
        },
      });
    }

    if (tradeWalletOps.length > 0) {
      await Wallet.bulkWrite(tradeWalletOps, { ordered: false });
    }
    console.log(`Processed batch of ${batch.length} orders.`);
  } catch (error) {
    console.error("Flush failed:", error);
    messages.push(...batch);
  } finally {
    processing = false;
  }
};
