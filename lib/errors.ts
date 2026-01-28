export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", options?: { cause?: unknown }) {
    super("VALIDATION_ERROR", message, options);
    this.name = "ValidationError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super("EXTERNAL_SERVICE_ERROR", message, options);
    this.name = "ExternalServiceError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super("DATABASE_ERROR", message, options);
    this.name = "DatabaseError";
  }
}

export function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function withCause(message: string, cause: unknown): Error {
  return new Error(message, { cause: asError(cause) });
}

