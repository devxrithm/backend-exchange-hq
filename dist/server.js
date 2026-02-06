"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_connection_1 = __importDefault(require("./config/db-config/db-connection"));
const startServer = async () => {
    await (0, db_connection_1.default)();
    app_1.app.listen(8000, () => {
        console.log("server running on port 3000");
        console.log(`Worker PID ${process.pid} listening`);
    });
};
startServer();
//# sourceMappingURL=server.js.map