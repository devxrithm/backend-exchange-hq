import mongoose, { Schema, Document, Types } from "mongoose";

interface ICurrencyAmount {
  currency: string;
  balance: number;
}

export interface IWallet extends Document {
  user: Types.ObjectId;
  currencyAmount: ICurrencyAmount[];
}

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currencyAmount: [
      {
        currency: {
          type: String,
          required: true,
          uppercase: true,
        },
        balance: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);

export { Wallet };
