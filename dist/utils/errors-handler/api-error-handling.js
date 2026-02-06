"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorHandling = void 0;
class ApiErrorHandling extends Error {
    statusCode;
    data;
    success;
    errors;
    constructor(statusCode, message = "Something went wrong in the server", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
    }
}
exports.ApiErrorHandling = ApiErrorHandling;
//# sourceMappingURL=api-error-handling.js.map