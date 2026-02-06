"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisInit = void 0;
const redis_connection_1 = require("./redis-connection");
const redisInit = async () => {
    try {
        await redis_connection_1.Redis.connect();
    }
    catch (error) {
        console.log(error);
    }
};
exports.redisInit = redisInit;
//# sourceMappingURL=redis-initialisatio.js.map