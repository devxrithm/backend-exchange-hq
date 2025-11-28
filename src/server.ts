import express from "express";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
const app = express();

app.get("/", (_req, res) => {
  res.send("server running on 3000");
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
