import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "ADMIN" | "USER";

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
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

export function toUserDTO(user: IUser): UserDTO {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const User = mongoose.model<IUser>("User", userSchema);
