import bcrypt from "bcryptjs";
import throwlhosPkg from "throwlhos";
import { User, UserRole, UserDTO, toUserDTO } from "../models/User.ts";
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

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw throwlhos.err_badRequest("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = new User({
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
  user.refreshToken = refreshToken;

  await user.save();

  return {
    user: toUserDTO(user),
    token: accessToken,
    refreshToken,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
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
  user.refreshToken = refreshToken;

  await user.save();

  return {
    user: toUserDTO(user),
    token: accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshTokenInput: string): Promise<{ token: string; refreshToken: string }> {
  const decoded = verifyRefreshToken(refreshTokenInput);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshTokenInput) {
    throw throwlhos.err_unauthorized("Invalid or revoked refresh token");
  }

  const newAccessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({ id: user._id.toString() });
  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function getUserProfile(userId: string): Promise<UserDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw throwlhos.err_notFound("User profile not found");
  }

  return toUserDTO(user);
}
