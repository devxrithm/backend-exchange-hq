import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

interface payload {
  _id: string;
  email?: string;
  fullname?: string;
}
interface expiresIN extends SignOptions {
  expiry: string;
}

export const AccessTokenJwtSign = (UserPayLoad: payload) =>
  jwt.sign(
    {
      UserPayLoad,
    },
    config.ACCESS_TOKEN_SECRET as Secret, //why we use as Secret? because we are using the secret key as a string and we need to convert it to a Secret type because jwt.sign function expects a Secret type but we are passing a config object which is a string
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRY,
    } as expiresIN //why we use as SignOptions? because we are using the expiry time as a string and we need to convert it to a SignOptions type because jwt.sign function expects a SignOptions type but we are passing a config object which is a type of string and we need to convert it to a SignOptions type
  );

export const RefreshTokenJwtSign = (UserPayLoad: payload) =>
  jwt.sign(
    {
      UserPayLoad,
    },
    config.REFRESH_TOKEN_SECRET as Secret, //why we use as Secret? because we are using the secret key as a string and we need to convert it to a Secret type because jwt.sign function expects a Secret type but we are passing a config object which is a string
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRY,
    } as expiresIN //why we use as SignOptions? because we are using the expiry time as a string and we need to convert it to a SignOptions type because jwt.sign function expects a SignOptions type but we are passing a config object which is a type of string and we need to convert it to a SignOptions type
  );
