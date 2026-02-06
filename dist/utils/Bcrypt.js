"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = exports.comparePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const comparePassword = async (password, hashpassword) => bcrypt_1.default.compare(password, hashpassword).catch(() => false);
exports.comparePassword = comparePassword;
const hashPassword = async (HashPassword, SaltRound) => bcrypt_1.default.hash(HashPassword, SaltRound || 10);
exports.hashPassword = hashPassword;
//# sourceMappingURL=Bcrypt.js.map