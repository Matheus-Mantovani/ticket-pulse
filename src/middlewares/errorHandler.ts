import { Request, Response, NextFunction } from "express";
import { ResponserResponse } from "../utils/response.ts";

export interface AppError {
  code?: number;
  status?: string;
  message?: string;
  errors?: unknown;
}

/**
 * Middleware global de captura e tratamento de erros do Express.
 * Formata os erros capturados (incluindo exceções throwlhos) no padrão do responser.
 */
export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const customErr = err as AppError;
  const code = customErr.code && typeof customErr.code === "number" ? customErr.code : 500;
  const message = customErr.message || "Internal Server Error";
  const errors = customErr.errors || undefined;

  const resRes = res as ResponserResponse;

  switch (code) {
    case 400:
      if (typeof resRes.send_badRequest === "function") {
        resRes.send_badRequest(message, errors);
        return;
      }
      break;
    case 401:
      if (typeof resRes.send_unauthorized === "function") {
        resRes.send_unauthorized(message, errors);
        return;
      }
      break;
    case 403:
      if (typeof resRes.send_forbidden === "function") {
        resRes.send_forbidden(message, errors);
        return;
      }
      break;
    case 404:
      if (typeof resRes.send_notFound === "function") {
        resRes.send_notFound(message, errors);
        return;
      }
      break;
    default:
      if (code >= 500 && typeof resRes.send_internalServerError === "function") {
        resRes.send_internalServerError(message, errors);
        return;
      }
      break;
  }

  // Fallback caso métodos do responser não estejam disponíveis
  res.status(code).json({
    status: customErr.status || "INTERNAL_SERVER_ERROR",
    code,
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}
