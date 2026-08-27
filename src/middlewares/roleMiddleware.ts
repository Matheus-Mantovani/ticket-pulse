import { Request, Response, NextFunction } from "express";
import throwlhosPkg from "throwlhos";
import { UserRole } from "../models/User.ts";
import { AuthenticatedRequest } from "./authMiddleware.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

/**
 * Middleware para restrição de acesso por papéis (RBAC).
 * Exemplo de uso: router.post("/events", authMiddleware, requireRole("ADMIN"), createEventController)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        throw throwlhos.err_unauthorized("Authentication required");
      }

      if (!allowedRoles.includes(authReq.user.role)) {
        throw throwlhos.err_forbidden(
          `Access denied: requires one of the following roles [${allowedRoles.join(", ")}]`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
