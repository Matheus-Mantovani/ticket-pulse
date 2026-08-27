import { Request, Response, NextFunction } from "express";

export interface AppError {
  code?: number;
  status?: string;
  message?: string;
  errors?: unknown;
}

/**
 * Middleware global de captura e tratamento centralizado de erros do Express.
 * Captura exceções disparadas via throwlhos ou erros gerais e formata no padrão responser.
 */
export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const customErr = err as AppError;
  const code = typeof customErr.code === "number" ? customErr.code : 500;
  const message = customErr.message || "Internal Server Error";
  const errors = customErr.errors || undefined;
  const status = customErr.status || (code >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");

  res.status(code).json({
    status,
    code,
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
}
