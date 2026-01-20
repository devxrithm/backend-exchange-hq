import { app } from "./app";
import dbConnect from "./config/db-config/db-connection";

const startServer = async () => {
  await dbConnect();
  app.listen(3000, () => {
    console.log("server running on port 3000");
  });
};

startServer();
