import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "ADMIN" | "USER";
export const UserRole = {
  ADMIN: "ADMIN" as UserRole,
  USER: "USER" as UserRole,
};

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.password;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
  },
});

export function toUserDTO(user: IUser): UserDTO {
  return {
    id: user._id ? user._id.toString() : "",
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class User {
  _id!: mongoose.Types.ObjectId;
  name!: string;
  email!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;

  toUserDTO(): UserDTO {
    return {
      id: this._id ? this._id.toString() : "",
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

userSchema.loadClass(User);

export const UserModel = mongoose.model<IUser>("User", userSchema);
