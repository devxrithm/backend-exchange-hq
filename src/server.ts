import { app } from "./app";
import dbConnect from "./config/db-config/db-connection";
import { config } from "./config/env-config/config";

const startServer = async () => {
  await dbConnect();
  app.listen(config.PORT, () => {
    console.log(`server running on port ${config.PORT}`);
    console.log(`Worker PID ${process.pid} listening`);
  });
};

startServer();
