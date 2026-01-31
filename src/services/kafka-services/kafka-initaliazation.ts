// import { Redis } from "../../config/redis-config/redis-connection";
import { orderHistory } from "../order-services/order-history/order-history-model";
import { IOrder, Order } from "../order-services/place-orders/order-model";
import { orderMatchingEngine } from "../../matching-engine-algorithm/orders-matching-engine";
import { Wallet } from "../wallet-services/wallet-model";
import kafkaConsumer from "./kafka-consumer";
import { Kafka } from "./kafka-producer";

const messages: IOrder[] = [];
let processing = false;

export const initKafkaService = async () => {
  try {
    await Kafka.connectToProducer();
    await kafkaConsumer.connectToConsumer();
    await kafkaConsume();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const kafkaConsume = async () => {
  try {
    await kafkaConsumer.subscribeToTopic("orders-detail");

    // Set up interval once, not per message
    setInterval(bulkInsertion, 5000);

    await kafkaConsumer.consume(async (message) => {
      // Add message to the batch
      messages.push(message);

      // Immediate bulk insertion if threshold reached
      if (messages.length >= 1000) {
        await bulkInsertion();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const bulkInsertion = async () => {
  if (processing || messages.length === 0) return;
  processing = true;
  const batch = messages.splice(0, 1000);
  //Start at index 0 and Remove 1000 elements and finally Return those 1000 elements

  try {
    await Order.insertMany(batch, { ordered: true });

    for (const order of batch) {
      // Deducted wallet balance update logic here
      if (order.orderSide === "BUY") {
        await Wallet.findOneAndUpdate(
          {
            user: order.user,
            asset: "USDT",
          },
          { $inc: { balance: -order.orderAmount } },
          { new: true },
        );
      } else {
        await Wallet.findOneAndUpdate(
          {
            user: order.user,
            asset: order.currencyPair,
          },
          { $inc: { balance: -order.orderQuantity } },
          { new: true },
        );
      }

      const trades = await orderMatchingEngine(order);
      console.log(trades);
      if (trades?.length) {
        await orderHistory.insertMany(trades);
        for (const trade of trades) {
          const sellerOrder = await Order.findOne({
            orderId: trade.sellerOrderId,
          });

          if (!sellerOrder) {
            console.error(`Seller order not found: ${trade.sellerOrderId}`);
            continue;
          }

          // Update wallets based on trade execution
          // Buyer receives the asset
          //here i used agregate function to update wallet balance
          const wallet = await Wallet.findOneAndUpdate(
            { user: trade.buyerUserId, asset: sellerOrder.currencyPair },
            { $inc: { balance: trade.tradedQuantity } }, // Buyer gets the asset
            { new: true, upsert: true },
          );
          //in case if wallet not created
          if (!wallet) {
            await Wallet.create({
              user: trade.buyerUserId,
              asset: sellerOrder.currencyPair,
              balance: trade.tradedQuantity,
            });
          }

          // Seller receives USDT
          const walletusdt = await Wallet.findOneAndUpdate(
            { user: trade.sellerUserId, asset: "USDT" },
            { $inc: { balance: trade.tradedQuantity * trade.executionPrice } }, // Seller gets USDT
            { new: true, upsert: true },
          );
          if (!walletusdt) {
            await Wallet.create({
              user: trade.sellerUserId,
              asset: "USDT",
              balance: trade.tradedQuantity * trade.executionPrice,
            });
          }
          // If order was partially filled, return remaining balance
          //   if (trade.tradedQuantity < order.orderQuantity) {
          //     const remainingAmount =
          //       order.orderSide === "BUY"
          //         ? (order.orderQuantity - trade.tradedQuantity) *
          //           order.entryPrice
          //         : order.orderQuantity - trade.tradedQuantity;

          //     await Wallet.findOneAndUpdate(
          //       {
          //         userId: order.user,
          //         asset: order.orderSide === "BUY" ? "USDT" : order.currencyPair,
          //       },
          //       { $inc: { balance: remainingAmount } },
          //       { new: true },
          //     );
          //   }
        }
      }
      console.log(`Processed ${batch.length} orders`);
    }
  } catch (error) {
    console.error("Flush failed:", error);
    messages.push(...batch);
  } finally {
    processing = false;
  }
};
