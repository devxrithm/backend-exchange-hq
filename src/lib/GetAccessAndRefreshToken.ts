import { Auth } from "../services/authServices/AuthModel";
import { ApiErrorHandling } from "../utils/ApiErrorHandling";
import { HttpCodes } from "./HttpCodes";

const getAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await Auth.findById(userId);
    // console.log(user)
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.GenrateAccessToken();
    const refreshToken = user.GenrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      throw new ApiErrorHandling(error.statusCode, error.message);
    }
    throw new ApiErrorHandling(
      HttpCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export { getAccessAndRefreshToken };
