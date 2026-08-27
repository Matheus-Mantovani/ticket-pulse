import { Request, Response, NextFunction } from "express";
import {
  checkRequiredFields,
  validateEmail,
  validateString,
} from "../utils/validation.ts";
import { ResponserResponse } from "../utils/response.ts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import * as authService from "../services/authService.ts";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    checkRequiredFields({ name, email, password });
    validateString(name, "name");
    validateEmail(email);
    validateString(password, "password");

    const result = await authService.registerUser({
      name,
      email,
      password,
      role,
    });

    const resRes = res as ResponserResponse;
    if (typeof resRes.send_created === "function") {
      resRes.send_created("User registered successfully", result);
    } else {
      res.status(201).json({
        status: "CREATED",
        code: 201,
        success: true,
        message: "User registered successfully",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    checkRequiredFields({ email, password });
    validateEmail(email);
    validateString(password, "password");

    const result = await authService.loginUser({ email, password });

    const resRes = res as ResponserResponse;
    if (typeof resRes.send_ok === "function") {
      resRes.send_ok("User logged in successfully", result);
    } else {
      res.status(200).json({
        status: "OK",
        code: 200,
        success: true,
        message: "User logged in successfully",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    checkRequiredFields({ refreshToken });
    validateString(refreshToken, "refreshToken");

    const result = await authService.refreshAccessToken(refreshToken);

    const resRes = res as ResponserResponse;
    if (typeof resRes.send_ok === "function") {
      resRes.send_ok("Access token refreshed successfully", result);
    } else {
      res.status(200).json({
        status: "OK",
        code: 200,
        success: true,
        message: "Access token refreshed successfully",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.id) {
      throw new Error("User context missing in request");
    }

    const userProfile = await authService.getUserProfile(authReq.user.id);

    const resRes = res as ResponserResponse;
    if (typeof resRes.send_ok === "function") {
      resRes.send_ok("User profile retrieved successfully", userProfile);
    } else {
      res.status(200).json({
        status: "OK",
        code: 200,
        success: true,
        message: "User profile retrieved successfully",
        data: userProfile,
      });
    }
  } catch (error) {
    next(error);
  }
}
