import mongoose from "mongoose";
import { config } from "../env-config/config";
import { ApiErrorHandling } from "../../utils/utils-export";

const dbConnect = async () => {
  try {
    await mongoose.connect(String(config.MONGO_DB_URI));
    console.log("mongoDB connected Succesfully");
  } catch (error) {
    if (error instanceof ApiErrorHandling) {
      throw new ApiErrorHandling(401, error.message, error.errors);
    }
    throw new ApiErrorHandling(401, "server error");
  }
};

export default dbConnect;
