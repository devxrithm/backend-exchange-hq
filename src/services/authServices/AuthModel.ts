import mongoose, { Schema, Document, Model } from "mongoose";
import { ApiErrorHandling } from "../../utils/ApiErrorHandling";
import { ComparePassword, HashPassword } from "../../utils/Bcrypt";
import { AccessTokenJwtSign, RefreshTokenJwtSign } from "../../utils/Jwt";

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
    if (!this.isModified("password")) return;
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
UserSchema.methods.GenrateAccessToken = function () {
  return AccessTokenJwtSign({
    _id: this._id,
    email: this.email,
    fullname: this.fullname,
  });
};

UserSchema.methods.genrateRefreshToken = function () {
  return RefreshTokenJwtSign({
    _id: this._id,
  });
};
export const Auth: Model<IAuth> = mongoose.model<IAuth>("User", UserSchema);
