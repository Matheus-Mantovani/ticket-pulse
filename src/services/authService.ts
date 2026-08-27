import bcrypt from "bcryptjs";
import throwlhosPkg from "throwlhos";
import { UserRole, UserDTO, toUserDTO } from "../models/User.ts";
import { IUserRepository } from "../repositories/IUserRepository.ts";
import { UserRepository } from "../repositories/UserRepository.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private userRepo: IUserRepository = new UserRepository()) {}

  async registerUser(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findByEmail(input.email.toLowerCase());
    if (existingUser) {
      throw throwlhos.err_badRequest("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepo.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: input.role || "USER",
    });

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    await this.userRepo.updateRefreshToken(user._id.toString(), refreshToken);
    user.refreshToken = refreshToken;

    return {
      user: toUserDTO(user),
      token: accessToken,
      refreshToken,
    };
  }

  async loginUser(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email.toLowerCase());
    if (!user || !user.password) {
      throw throwlhos.err_unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw throwlhos.err_unauthorized("Invalid email or password");
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    await this.userRepo.updateRefreshToken(user._id.toString(), refreshToken);
    user.refreshToken = refreshToken;

    return {
      user: toUserDTO(user),
      token: accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshTokenInput: string
  ): Promise<{ token: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(refreshTokenInput);

    const user = await this.userRepo.findById(decoded.id);
    if (!user || user.refreshToken !== refreshTokenInput) {
      throw throwlhos.err_unauthorized("Invalid or revoked refresh token");
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });
    await this.userRepo.updateRefreshToken(user._id.toString(), newRefreshToken);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getUserProfile(userId: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw throwlhos.err_notFound("User profile not found");
    }

    return toUserDTO(user);
  }
}

export const defaultAuthService = new AuthService();
