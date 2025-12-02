import { app } from "./app";
import dbConnect from "./config/dbConnection";

const StartServer = async () => {
  await dbConnect();
  app.listen(3000, () => {
    console.log("server running on port 3000");
  });
};

StartServer();
