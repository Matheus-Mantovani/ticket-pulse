import { assertEquals, assertExists } from "@std/assert";
import { AuthController } from "../../src/controllers/authController.ts";
import { IUserRepository } from "../../src/repositories/IUserRepository.ts";
import { IUser } from "../../src/models/User.ts";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./mockExpress.ts";

function createMockUserRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: (_email: string) => Promise.resolve(null),
    findById: (_id: string) => Promise.resolve(null),
    create: (data: Partial<IUser>) =>
      Promise.resolve({
        _id: "mock_user_id_123",
        name: data.name || "Test User",
        email: data.email || "test@example.com",
        role: data.role || "USER",
        password: data.password || "hashed_pass",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IUser),
    updateRefreshToken: (_id: string, _token: string | null) => Promise.resolve(),
    ...overrides,
  };
}

Deno.test("AuthController Unit Tests", async (t) => {
  await t.step("POST /register - Registra usuário no controller com retorno de sucesso", async () => {
    const mockRepo = createMockUserRepo({
      findByEmail: (email: string) => {
        assertEquals(email, "novo@example.com");
        return Promise.resolve(null);
      },
      create: (data: Partial<IUser>) => {
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439011",
          name: data.name,
          email: data.email,
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IUser);
      },
      updateRefreshToken: (id: string, token: string | null) => {
        assertEquals(id, "507f1f77bcf86cd799439011");
        assertExists(token);
        return Promise.resolve();
      },
    });

    const controller = new AuthController(mockRepo);

    const req = createMockRequest({
      body: {
        name: "Novo Usuario",
        email: "novo@example.com",
        password: "password123",
      },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.register(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 201);
    assertExists(data);
    const result = data as { user: { email: string }; token: string; refreshToken: string };
    assertEquals(result.user.email, "novo@example.com");
    assertExists(result.token);
    assertExists(result.refreshToken);
  });

  await t.step("POST /login - Autentica usuário com sucesso e salva refresh token", async () => {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash("password123", 10);

    const mockRepo = createMockUserRepo({
      findByEmail: (email: string) => {
        assertEquals(email, "user@example.com");
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439012",
          name: "User Exemplo",
          email: "user@example.com",
          password: hashedPassword,
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IUser);
      },
    });

    const controller = new AuthController(mockRepo);

    const req = createMockRequest({
      body: {
        email: "user@example.com",
        password: "password123",
      },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.login(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 200);
    assertExists(data);
    const result = data as { user: { email: string }; token: string };
    assertEquals(result.user.email, "user@example.com");
    assertExists(result.token);
  });

  await t.step("GET /me - Retorna perfil autenticado diretamente do controller", async () => {
    const mockRepo = createMockUserRepo({
      findById: (id: string) => {
        assertEquals(id, "507f1f77bcf86cd799439012");
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439012",
          name: "User Exemplo",
          email: "user@example.com",
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IUser);
      },
    });

    const controller = new AuthController(mockRepo);

    const req = createMockRequest({
      user: {
        id: "507f1f77bcf86cd799439012",
        email: "user@example.com",
        role: "USER",
      },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.me(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 200);
    assertExists(data);
    const result = data as { email: string };
    assertEquals(result.email, "user@example.com");
  });
});
