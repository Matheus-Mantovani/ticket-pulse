import { Query } from "mongoose";
import { IUser } from "../models/User.ts";

export interface IUserRepository {
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  findByEmail(email: string): Query<IUser | null, IUser> | Promise<IUser | null>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  findById(id: string): Query<IUser | null, IUser> | Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  updateRefreshToken(
    id: string,
    refreshToken: string | null
  ): Query<IUser | null, IUser> | Promise<IUser | null> | Promise<void>;
}
