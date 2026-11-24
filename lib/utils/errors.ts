export type AppErrorCode =
  | "CONFIG_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "EXTERNAL_PROVIDER_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly safeMessage: string;

  constructor(options: {
    code: AppErrorCode;
    message: string;
    safeMessage?: string;
    statusCode?: number;
  }) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.safeMessage = options.safeMessage ?? options.message;
    this.statusCode = options.statusCode ?? mapErrorCodeToStatus(options.code);
  }
}

function mapErrorCodeToStatus(code: AppErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "EXTERNAL_PROVIDER_ERROR":
      return 502;
    case "CONFIG_ERROR":
    case "INTERNAL_ERROR":
      return 500;
  }
}

export function toSafeErrorSummary(error: unknown): { code: AppErrorCode; message: string } {
  if (error instanceof AppError) {
    return { code: error.code, message: error.safeMessage };
  }
  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred. Please try again.",
  };
}
