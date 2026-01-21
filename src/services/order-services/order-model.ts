import mongoose, { Schema, Document, Types } from "mongoose";

interface IOrder extends Document {
  user: Types.ObjectId;
  currencyPair: string;
  orderQuantity: number;
  orderAmount: number;
  orderType: string;
  entryPrice: number;
  positionStatus: string;
  pnl: number;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currencyPair: {
      type: String,
      required: true,
    },
    orderQuantity: {
      type: Number,
      required: true,
    },
    orderAmount: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    positionStatus: {
      type: String,
      enum: ["Pending", "Filled", "Closed", "Cancelled"],
      default: "Pending",
    },
    pnl: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export { Order };
