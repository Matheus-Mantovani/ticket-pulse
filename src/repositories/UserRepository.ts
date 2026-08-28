import { UserModel, IUser } from "../models/User.ts";
import { IUserRepository } from "./IUserRepository.ts";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { refreshToken });
  }
}
