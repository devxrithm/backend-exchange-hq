import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IOrderHistory extends Document {
  buyerID: Types.ObjectId;
  sellerID: Types.ObjectId;
  buyerOrderId: string;
  sellerOrderId: string;
  currencyPair: string;
  orderAmount: number;
  orderType: string;
  orderSide: string;
  tradedQuantity: number;
  executionPrice: number;
  status: string;
  realizedPnL: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderHistorySchema = new Schema<IOrderHistory>(
  {
    buyerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerOrderId: {
      type: String,
      required: true,
      index: true,
    },
    sellerOrderId: {
      type: String,
      required: true,
      index: true,
    },
    currencyPair: {
      type: String,
      required: true,
    },
    tradedQuantity: {
      type: Number,
      required: true,
    },
    orderAmount: {
      type: Number,
      required: true,
    },
    executionPrice: {
      type: Number,
      required: true,
    },
    orderSide: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["Market"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Filled", "Partially Filled"],
    },
    realizedPnL: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const orderHistory: Model<IOrderHistory> = mongoose.model<IOrderHistory>(
  "OrderHistory",
  orderHistorySchema,
);

export { orderHistory };
