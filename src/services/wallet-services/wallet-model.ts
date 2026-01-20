import mongoose, { Schema } from "mongoose";

const walletSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currencyAmount: [
      {
        currency: {
          type: String,
          required: true, // e.g. BTC, ETH, USDT
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
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export { Wallet };
