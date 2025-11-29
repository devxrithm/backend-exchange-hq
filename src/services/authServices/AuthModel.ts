import mongoose, { Schema, Document, Model } from "mongoose";

import jwt, { SignOptions, Secret, JwtPayload } from "jsonwebtoken";
import { config } from "../../config/config";
import { ApiErrorHandling } from "../../utils/ApiErrorHandling";
import { ComparePassword, HashPassword } from "../../utils/Bcrypt";

interface IAuth extends Document {
  fullname: string;
  email: string;
  password: string;
  refreshToken: string;
}

const UserSchema: Schema<IAuth> = new Schema<IAuth>(
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

//do some stuff before saving password. it will convert plain password in random salt using bcrypt library . this function used mongoose inBuilt middleware hook 'pre' which is genrally used to do some stuff in data before saving in a database

UserSchema.pre<IAuth>("save", async function (): Promise<void> {
  try {
    if (!this.isModified("password")) {
      return;
    }
    this.password = await HashPassword(this.password, 10);
  } catch (error) {
    console.log("error in password field schema", error);
    const msg = error instanceof Error ? error.message : String(error);
    throw new ApiErrorHandling(500, msg, [msg]);
  }
});

//this inbuilt function is used to create a custom own method, which further used in to check password and all

UserSchema.methods.isPasswordCorrect = async function (password: string) {
  return await ComparePassword(password, this.password);
};

// generate access and refresh token via mongoose inbuilt method generator, use this keyword to access
UserSchema.methods.genrateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    } as JwtPayload,
    config.ACCESS_TOKEN_SECRET as Secret, //why we use as Secret? because we are using the secret key as a string and we need to convert it to a Secret type because jwt.sign function expects a Secret type but we are passing a config object which is a string
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRY,
    } as SignOptions //why we use as SignOptions? because we are using the expiry time as a string and we need to convert it to a SignOptions type because jwt.sign function expects a SignOptions type but we are passing a config object which is a type of string and we need to convert it to a SignOptions type
  ) as string;
};

UserSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRY,
    } as SignOptions
  );
};
export const Auth: Model<IAuth> = mongoose.model<IAuth>("User", UserSchema);
