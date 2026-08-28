import { Query } from "mongoose";
import { UserModel, IUser } from "../models/User.ts";
import { BaseRepository } from "./BaseRepository.ts";
import { IUserRepository } from "./IUserRepository.ts";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  findByEmail(email: string): Query<IUser | null, IUser> {
    return this.findOne({ email });
  }

  create(userData: Partial<IUser>): Promise<IUser> {
    return this.createOne(userData);
  }

  updateRefreshToken(
    id: string,
    refreshToken: string | null
  ): Query<IUser | null, IUser> {
    return this.updateById(id, { refreshToken });
  }
}
