import {
  ApiErrorHandling,
  ApiResponse,
  AuthRequest,
  HttpCodes,
  Order,
  Redis,
  Response,
} from "./orders-controller";

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

    if (orderIds.length) {
      const pipeline = redis.multi();
      orderIds.forEach((orderId) => {
        pipeline.hmGet(`orderID:${orderId}`, [
          "orderId",
          "orderSide",
          "orderQuantity",
          "entryPrice",
          "positionStatus",
        ]);
      });
      console.time("redis");
      const result = await pipeline.exec();
      console.timeEnd("redis");

      return res
        .status(HttpCodes.OK)
        .json(new ApiResponse(HttpCodes.OK, result, "Live trades from redis"));
    }

    const orders = await Order.find({ user: "696f330085f796568d1339ea" }).sort({
      createdAt: -1,
    });

    //push to Redis
    orders.forEach((order) => {
      const orderId = order.orderId;
      redis
        .multi()
        .hSet(`orderID:${orderId}`, {
          orderId: order.orderId,
          userId: order.user.toString(),
          currencyPair: order.currencyPair,
          orderSide: order.orderSide,
          orderType: order.orderType,
          entryPrice: order.entryPrice.toString(),
          orderAmount: order.orderAmount.toString(),
          orderQuantity: order.orderQuantity.toString(),
          positionStatus: order.positionStatus,
        })
        .expire(`orderID:${orderId}`, 60)
        .zAdd(`user:openOrders:${order.user}`, {
          score: Number(order.createdAt?.getTime()),
          value: order.orderId,
        })
        .expire(`user:openOrders:${order.user}`, 60)
        .exec();
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
