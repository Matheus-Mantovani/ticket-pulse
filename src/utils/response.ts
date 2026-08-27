import { Response } from "express";

export interface StandardApiResponse<T = unknown> {
  status: string;
  code: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

/**
 * Interface estendida do Express Response para incluir métodos dinâmicos injetados pelo responser.
 */
export interface ResponserResponse extends Response {
  send_ok?: (message?: string, content?: unknown) => void;
  send_created?: (message?: string, content?: unknown) => void;
  send_badRequest?: (message?: string, errors?: unknown) => void;
  send_unauthorized?: (message?: string, errors?: unknown) => void;
  send_forbidden?: (message?: string, errors?: unknown) => void;
  send_notFound?: (message?: string, errors?: unknown) => void;
  send_internalServerError?: (message?: string, errors?: unknown) => void;
}

/**
 * Formata manualmente a resposta HTTP no padrão responser caso necessário.
 */
export function buildResponse<T = unknown>(
  code: number,
  status: string,
  message: string,
  content?: T
): StandardApiResponse<T> {
  const success = code >= 200 && code < 300;
  return {
    status,
    code,
    success,
    message,
    ...(success && content !== undefined ? { data: content } : {}),
    ...(!success && content !== undefined ? { errors: content } : {}),
  };
}
