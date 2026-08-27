import jwt from "jsonwebtoken";
import throwlhosPkg from "throwlhos";
import { UserRole } from "../models/User.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export interface AccessTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  id: string;
}

function getJwtSecret(): string {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = Deno.env.get("JWT_REFRESH_SECRET");
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured in environment variables");
  }
  return secret;
}

/**
 * Gera um Access Token JWT com validade de 15 minutos.
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

/**
 * Gera um Refresh Token JWT com validade de 7 dias.
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: "7d" });
}

/**
 * Verifica e decodifica um Access Token JWT.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === "TokenExpiredError") {
      throw throwlhos.err_unauthorized("Access token has expired");
    }
    throw throwlhos.err_unauthorized("Invalid access token");
  }
}

/**
 * Verifica e decodifica um Refresh Token JWT.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, getJwtRefreshSecret()) as RefreshTokenPayload;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === "TokenExpiredError") {
      throw throwlhos.err_unauthorized("Refresh token has expired");
    }
    throw throwlhos.err_unauthorized("Invalid refresh token");
  }
}
