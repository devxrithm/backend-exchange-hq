import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IOrderHistory extends Document {
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

const orderHistorySchema = new Schema<IOrderHistory>(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerUserId: {
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
    tradedQuantity: {
      type: Number,
      required: true,
    },
    executionPrice: {
      type: Number,
      required: true,
    },
    orderAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Filled", "Partially Filled"],
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
