export { redis } from "../../../config/redis-config/redis-connection";
export { kafka } from "../../kafka-services/kafka-producer";

export { Response } from "express";
export { Order } from "../order-model";
export { Wallet } from "../../wallet-services/wallet-model";
export {
  ApiErrorHandling,
  ApiResponse,
  HttpCodes,
} from "../../../utils/utils-export";
export { AuthRequest } from "../../../middleware/jwt-verify";

export interface IBuyRequestBody {
  currencyPair: string;
  orderType: "market";
  entryPrice: number;
  positionStatus: "open" | "closed";
  orderAmount: number;
  orderSide: "BUY" | "SELL"; // USDT
}

export interface ISellRequestBody extends IBuyRequestBody {
  orderQuantity: number;
}
