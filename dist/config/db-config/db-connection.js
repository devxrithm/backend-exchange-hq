"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../env-config/config");
const utils_export_1 = require("../../utils/utils-export");
const dbConnect = async () => {
    try {
        await mongoose_1.default.connect(String(config_1.config.MONGO_DB_URI));
        console.log("mongoDB connected Succesfully");
    }
    catch (error) {
        if (error instanceof utils_export_1.ApiErrorHandling) {
            throw new utils_export_1.ApiErrorHandling(401, error.message, error.errors);
        }
        throw new utils_export_1.ApiErrorHandling(501, "server error");
    }
};
exports.default = dbConnect;
//# sourceMappingURL=db-connection.js.map