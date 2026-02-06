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
exports.Auth = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const utils_export_1 = require("../../utils/utils-export");
const UserSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true,
});
//do some stuff before saving password. it will convert plain password in random salt using bcrypt library . this function used mongoose inBuilt middleware hook 'pre' which is genrally used to do some stuff in data before saving in a database
UserSchema.pre("save", async function () {
    try {
        if (!this.isModified("password"))
            return;
        this.password = await (0, utils_export_1.hashPassword)(this.password, 10);
    }
    catch (error) {
        const msg = error instanceof utils_export_1.ApiErrorHandling ? error.message : String(error);
        throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", [msg]);
    }
});
//this inbuilt function is used to create a custom own method, which further used in to check password and all
UserSchema.methods.IsPasswordCorrect = async function (password) {
    return await (0, utils_export_1.comparePassword)(password, this.password);
};
// generate access and refresh token via mongoose inbuilt method generator, use this keyword to access
UserSchema.methods.GenrateAccessToken = function () {
    return (0, utils_export_1.accessTokenJwtSign)({
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
    });
};
UserSchema.methods.GenrateRefreshToken = function () {
    return (0, utils_export_1.refreshTokenJwtSign)({
        _id: this._id,
    });
};
exports.Auth = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=auth-model.js.map