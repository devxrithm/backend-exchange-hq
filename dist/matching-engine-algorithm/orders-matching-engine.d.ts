import { IOrder } from "../services/order-services/place-orders/order-model";
export declare const orderMatchingEngine: (message: IOrder) => Promise<{
    currencyPair: string;
    buyerUserId: string | import("mongoose").Types.ObjectId;
    sellerUserId: string | import("mongoose").Types.ObjectId;
    buyerOrderId: string;
    sellerOrderId: string;
    tradedQuantity: number;
    executionPrice: number;
    orderAmount: number;
    status: string;
}[]>;
//# sourceMappingURL=orders-matching-engine.d.ts.map