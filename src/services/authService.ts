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

export namespace AuthService {
  export type TTokenPayload = {
    id: string;
    email: string;
    role: UserRole;
  };

  export type TUserSanitized = UserDTO;

  export namespace Register {
    export type Input = {
      input: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
      };
    };
    export type Output = {
      user: UserDTO;
      token: string;
      refreshToken: string;
    };
  }

  export namespace Login {
    export type Input = {
      input: {
        email: string;
        password: string;
      };
    };
    export type Output = {
      user: UserDTO;
      token: string;
      refreshToken: string;
    };
  }

  export namespace RefreshAccessToken {
    export type Input = {
      input: {
        refreshToken: string;
      };
    };
    export type Output = {
      token: string;
      refreshToken: string;
    };
  }

  export namespace GetUserById {
    export type Input = {
      input: {
        userId: string;
      };
    };
    export type Output = UserDTO;
  }
}

export class AuthService {
  constructor(private userRepo: IUserRepository = new UserRepository()) {}

  async register(
    params: AuthService.Register.Input
  ): Promise<AuthService.Register.Output> {
    const { name, email, password, role } = params.input;
    const existingUser = await this.userRepo.findByEmail(email.toLowerCase());

    if (existingUser) {
      throw throwlhos.err_badRequest("User with this email already exists", {
        email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || UserRole.USER,
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

  async login(
    params: AuthService.Login.Input
  ): Promise<AuthService.Login.Output> {
    const { email, password } = params.input;
    const user = await this.userRepo.findByEmail(email.toLowerCase());

    if (!user || !user.password) {
      throw throwlhos.err_unauthorized("Invalid email or password", { email });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw throwlhos.err_unauthorized("Invalid email or password", { email });
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
    paramsOrToken: AuthService.RefreshAccessToken.Input | string
  ): Promise<AuthService.RefreshAccessToken.Output> {
    // [TEMPORÁRIO - REMOVER NA ETAPA 4] Suporte para string direta do controller legado
    const refreshTokenInput =
      typeof paramsOrToken === "string"
        ? paramsOrToken
        : paramsOrToken.input.refreshToken;

    const decoded = verifyRefreshToken(refreshTokenInput);

    const user = await this.userRepo.findById(decoded.id);
    if (!user || user.refreshToken !== refreshTokenInput) {
      throw throwlhos.err_unauthorized("Invalid or revoked refresh token", {
        refreshToken: refreshTokenInput,
      });
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

  async getUserById(
    params: AuthService.GetUserById.Input
  ): Promise<AuthService.GetUserById.Output> {
    const { userId } = params.input;
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw throwlhos.err_notFound("User profile not found", { userId });
    }

    return toUserDTO(user);
  }

  // [TEMPORÁRIO - REMOVER NA ETAPA 4] Retrocompatibilidade temporária para controllers existentes
  registerUser(input: AuthService.Register.Input["input"]) {
    return this.register({ input });
  }

  loginUser(input: AuthService.Login.Input["input"]) {
    return this.login({ input });
  }

  getUserProfile(userId: string) {
    return this.getUserById({ input: { userId } });
  }
}

// [TEMPORÁRIO - REMOVER NA ETAPA 4] Export de instância default para controllers legados
export const defaultAuthService = new AuthService();
