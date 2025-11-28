import mongoose, { Schema, Document, Model } from "mongoose";

interface IAuth extends Document {
  fullname: string;
  email: string;
  password: string;
  refreshToken: string;
}

const AuthSchema: Schema<IAuth> = new Schema<IAuth>(
  {
    fullname: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Auth: Model<IAuth> = mongoose.model<IAuth>("User", AuthSchema);
