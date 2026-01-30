import { IOrder } from "../order-model";
import {
  ApiErrorHandling,
  ApiResponse,
  AuthRequest,
  HttpCodes,
  Order,
  Redis,
  Response,
} from "../orders-controllers/export";

export const openPosition = async (
  _req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    // const userId = req.user?._id;
    // if (!userId) {
    //   throw new ApiErrorHandling(HttpCodes.UNAUTHORIZED, "Unauthorized");
    // }

    const redis = Redis.getClient();

    const orderIds = await redis.zRange(
      "user:openOrders:696f330085f796568d1339ea",
      0,
      5,
    );
    // console.log(orderIds);
    if (orderIds.length) {
      const result = await Promise.all(
        orderIds.map(async (Id: IOrder) => {
          const detail = await redis.hmGet(`orderID:${Id}`, [
            "orderId",
            "orderSide",
            "orderQuantity",
            "entryPrice",
            "positionStatus",
          ]);
          return detail;
        }),
      );
      return res
        .status(HttpCodes.OK)
        .json(new ApiResponse(HttpCodes.OK, result, "Live trades from redis"));
    }

    const orders = await Order.find({ user: "696f330085f796568d1339ea" }).sort({
      createdAt: -1,
    });

    //push to Redis
    orders.forEach(async (order) => {
      const orderId = order.orderId;
      await Promise.all([
        redis.hSet(`orderID:${orderId}`, {
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
        redis.expire(`orderID:${orderId}`, 120),
        redis.zAdd(`user:openOrders:${order.user}`, {
          score: Number(order.createdAt?.getTime()),
          value: order.orderId,
        }),
        redis.expire(`user:openOrders:${order.user}`, 120),
      ]);
    });

    return res
      .status(HttpCodes.OK)
      .json(new ApiResponse(HttpCodes.OK, orders, "Live from DB trades"));
  } catch (error) {
    console.log(error);
    if (error instanceof ApiErrorHandling) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            HttpCodes.INTERNAL_SERVER_ERROR,
            null,
            "Internal Server Error",
          ),
        );
    }
  }
};
