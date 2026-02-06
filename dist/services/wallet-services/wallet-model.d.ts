import mongoose, { Document, Types } from "mongoose";
export interface IWallet extends Document {
    user: Types.ObjectId;
    asset: string;
    balance: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Wallet: mongoose.Model<IWallet, {}, {}, {}, mongoose.Document<unknown, {}, IWallet, {}, mongoose.DefaultSchemaOptions> & IWallet & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any, IWallet>;
export { Wallet };
//# sourceMappingURL=wallet-model.d.ts.map