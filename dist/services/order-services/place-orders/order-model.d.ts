import { Document, Types, Model } from "mongoose";
export interface IOrder extends Document {
    user: Types.ObjectId;
    orderId: string;
    currencyPair: string;
    orderQuantity: number;
    orderAmount: number;
    orderType: string;
    orderSide: string;
    entryPrice: number;
    positionStatus: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Order: Model<IOrder>;
export { Order };
//# sourceMappingURL=order-model.d.ts.map