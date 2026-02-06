import { Document, Model } from "mongoose";
interface IAuth extends Document {
    fullName: string;
    email: string;
    password: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
    GenrateAccessToken(): string;
    GenrateRefreshToken(): string;
    IsPasswordCorrect(password: string): Promise<boolean>;
}
export declare const Auth: Model<IAuth>;
export {};
//# sourceMappingURL=auth-model.d.ts.map