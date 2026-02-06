"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderHistory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const orderHistorySchema = new mongoose_1.Schema({
    currencyPair: {
        type: String,
        required: true,
    },
    buyerUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sellerUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    buyerOrderId: {
        type: String,
        required: true,
        index: true,
    },
    sellerOrderId: {
        type: String,
        required: true,
        index: true,
    },
    tradedQuantity: {
        type: Number,
        required: true,
    },
    executionPrice: {
        type: Number,
        required: true,
    },
    orderAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Filled", "Partially Filled"],
    },
}, {
    timestamps: true,
});
const orderHistory = mongoose_1.default.model("OrderHistory", orderHistorySchema);
exports.orderHistory = orderHistory;
//# sourceMappingURL=order-history-model.js.map