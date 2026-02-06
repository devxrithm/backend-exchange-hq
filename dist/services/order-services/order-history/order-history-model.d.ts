import { Document, Types, Model } from "mongoose";
export interface IOrderHistory extends Document {
    currencyPair: string;
    buyerUserId: Types.ObjectId;
    sellerUserId: Types.ObjectId;
    buyerOrderId: string;
    sellerOrderId: string;
    tradedQuantity: number;
    executionPrice: number;
    orderAmount: number;
    status: string;
    buyerRealizedPnL: number;
    sellerRealizedPnL: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const orderHistory: Model<IOrderHistory>;
export { orderHistory };
//# sourceMappingURL=order-history-model.d.ts.map