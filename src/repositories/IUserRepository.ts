import { IUser } from "../models/User.ts";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
}
