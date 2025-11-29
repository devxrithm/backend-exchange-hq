import { app } from "./app";

const StartServer = () => {
  app.listen(3000, () => {
    console.log("server running on port 3000");
  });
};

StartServer();
