export class ApiErrorHandling extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message = "Something went wrong in the server",
    errors = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }
}
