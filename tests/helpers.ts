import "dotenv/config";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/app.ts";
import { disconnectDatabase } from "../src/config/database.ts";
import { User, IUser } from "../src/models/User.ts";
import { Event } from "../src/models/Event.ts";
import { Ticket } from "../src/models/Ticket.ts";
import { generateAccessToken, generateRefreshToken } from "../src/utils/jwt.ts";

export { app, supertest };

/**
 * Conecta exclusivamente à database isolada de testes ('ticket_pulse_tests').
 */
export async function setupTestDB(): Promise<void> {
  const envTestUri = Deno.env.get("MONGO_URI_TEST");
  const mainUri = Deno.env.get("MONGO_URI");

  const testUri =
    envTestUri ||
    (mainUri ? mainUri.replace("/ticket_pulse", "/ticket_pulse_tests") : undefined);

  if (!testUri) {
    throw new Error("MONGO_URI_TEST or MONGO_URI is not configured in environment");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
}

/**
 * Desconecta do MongoDB Atlas após a execução dos testes.
 */
export async function teardownTestDB(): Promise<void> {
  await disconnectDatabase();
}

/**
 * Limpa todas as coleções do banco de testes ('ticket_pulse_tests').
 */
export async function clearDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    await Ticket.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
  }
}

export interface TestUserCredentials {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Cria um usuário de teste (ADMIN ou USER) e retorna credenciais e tokens válidos.
 */
export async function createTestUser(
  role: "ADMIN" | "USER" = "USER",
  customEmail?: string
): Promise<TestUserCredentials> {
  const email = customEmail || `${role.toLowerCase()}_${Date.now()}@test.com`;
  const user = new User({
    name: `Test ${role}`,
    email,
    password: "$2a$10$e8W1.z3.H017H/u5y4lF/.y3K8F1V4Wv9Gv9v9v9v9v9v9v9v9v9", // Hash pré-calculado para senha 'password123'
    role,
  });

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
  });

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
}
