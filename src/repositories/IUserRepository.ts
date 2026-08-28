import { Query } from "mongoose";
import { IUser } from "../models/User.ts";

export interface IUserRepository {
  findByEmail(email: string): Query<IUser | null, IUser>;
  findById(id: string): Query<IUser | null, IUser>;
  create(userData: Partial<IUser>): Promise<IUser>;
  updateRefreshToken(
    id: string,
    refreshToken: string | null
  ): Query<IUser | null, IUser>;
}
