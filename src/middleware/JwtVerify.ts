import { Auth } from "../services/authServices/AuthModel";
import { ApiErrorHandling } from "../utils/ApiErrorHandling";
import { NextFunction, Request, Response } from "express";
import { JwtVerify } from "../utils/Jwt";
import { HttpCodes } from "../lib/HttpCodes";

interface user {
  fullname: string;
  email: string;
}
const verifyJWT = async (
  req: Request<{}, {}, user>,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token: string = req.cookies?.accessToken;
    if (!token) {
      throw new ApiErrorHandling(400, "token invalid");
    }
    const decodedToken = JwtVerify(token);
    if (!decodedToken) {
      throw new ApiErrorHandling(HttpCodes.BAD_REQUEST, "Invalid Token");
    }
    // console.log(decodedToken)
    const user = await Auth.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    // console.log(user)
    if (!user) {
      throw new ApiErrorHandling(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiErrorHandling(401, "Invalid access token");
  }
};

export { verifyJWT };
