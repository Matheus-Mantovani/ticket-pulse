import { Request, Response, NextFunction } from "express";
import { Query } from "mongoose";

export function mockQuery<T, DocType = T>(result: T): Query<T, DocType> {
  const promise = Promise.resolve(result);
  const q = promise as unknown as Query<T, DocType>;
  // deno-lint-ignore no-explicit-any
  q.exec = (() => promise) as any;
  // deno-lint-ignore no-explicit-any
  q.lean = (() => q) as any;
  // deno-lint-ignore no-explicit-any
  q.select = (() => q) as any;
  // deno-lint-ignore no-explicit-any
  q.populate = (() => q) as any;
  return q;
}

export function createMockRequest(options: {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  user?: { id: string; email: string; role: "ADMIN" | "USER" };
}): Request {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: {},
    user: options.user,
  } as unknown as Request;
}

export function createMockResponse(): {
  res: Response;
  getMockData: () => { statusCode: number; data: unknown; message?: string };
} {
  const state = {
    statusCode: 200,
    responseData: null as unknown,
    sentMessage: undefined as string | undefined,
  };

  const mockRes = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(code: number) {
      state.statusCode = code;
    },
    status(code: number) {
      state.statusCode = code;
      return this as unknown as Response;
    },
    json(data: unknown) {
      state.responseData = data;
      return this as unknown as Response;
    },
    send_created(message: string, data: unknown) {
      state.statusCode = 201;
      state.sentMessage = message;
      state.responseData = data;
      return this as unknown as Response;
    },
    send_ok(message: string, data: unknown) {
      state.statusCode = 200;
      state.sentMessage = message;
      state.responseData = data;
      return this as unknown as Response;
    },
  };

  return {
    res: mockRes as unknown as Response,
    getMockData: () => ({
      statusCode: state.statusCode,
      data: state.responseData,
      message: state.sentMessage,
    }),
  };
}

export function createMockNext(): {
  next: NextFunction;
  getError: () => unknown;
} {
  let capturedError: unknown = null;
  const next: NextFunction = (err?: unknown) => {
    if (err) capturedError = err;
  };

  return {
    next,
    getError: () => capturedError,
  };
}
