export declare class ApiErrorHandling extends Error {
    statusCode: number;
    data: null;
    success: boolean;
    errors: string[];
    constructor(statusCode: number, message?: string, errors?: string[]);
}
//# sourceMappingURL=api-error-handling.d.ts.map