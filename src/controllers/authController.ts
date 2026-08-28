import { Request, Response, NextFunction } from "express";
import throwlhosPkg from "throwlhos";
import {
  checkRequiredFields,
  validateEmail,
  validateString,
} from "../utils/validation.ts";
import { ResponserResponse } from "../utils/response.ts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import { AuthService } from "../services/authService.ts";
import { IUserRepository } from "../repositories/IUserRepository.ts";
import { UserRepository } from "../repositories/UserRepository.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export class AuthController {
  private authService: AuthService;

  constructor(userRepo: IUserRepository = new UserRepository()) {
    this.authService = new AuthService(userRepo);
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;

      checkRequiredFields({ name, email, password });
      validateString(name, "name");
      validateEmail(email);
      validateString(password, "password");

      const result = await this.authService.register({
        input: {
          name,
          email,
          password,
          role,
        },
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
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      checkRequiredFields({ email, password });
      validateEmail(email);
      validateString(password, "password");

      const result = await this.authService.login({
        input: {
          email,
          password,
        },
      });

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
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      checkRequiredFields({ refreshToken });
      validateString(refreshToken, "refreshToken");

      const result = await this.authService.refreshAccessToken({
        input: {
          refreshToken,
        },
      });

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
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.id) {
        throw throwlhos.err_unauthorized("User context missing in request", {
          context: "authReq.user",
        });
      }

      const userProfile = await this.authService.getUserById({
        input: {
          userId: authReq.user.id,
        },
      });

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
  };
}

export const defaultAuthController = new AuthController();
