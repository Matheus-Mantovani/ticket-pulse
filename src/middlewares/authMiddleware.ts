import { Request, Response, NextFunction } from "express";
import throwlhosPkg from "throwlhos";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export interface AuthenticatedUser extends AccessTokenPayload {}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware para validar o token JWT Bearer no cabeçalho Authorization.
 * Se o token for válido, anexa as informações do usuário em req.user.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw throwlhos.err_unauthorized(
        "Authorization header missing or invalid. Format must be: Bearer <token>"
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw throwlhos.err_unauthorized("Access token is missing");
    }

    const decoded = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}
