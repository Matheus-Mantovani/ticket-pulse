import { assertEquals, assertExists } from "@std/assert";
import { app, supertest, setupTestDB, teardownTestDB, clearDatabase, createTestUser } from "./helpers.ts";

Deno.test({
  name: "Auth Endpoints Integration Tests",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn(t) {
    await setupTestDB();
    await clearDatabase();

    await t.step("POST /api/auth/register - Registra novo usuário com sucesso (201)", async () => {
      const res = await supertest(app)
        .post("/api/auth/register")
        .send({
          name: "Gabriel Silva",
          email: "gabriel.silva@example.com",
          password: "password123",
          role: "USER",
        });

      assertEquals(res.status, 201);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.user);
      assertExists(res.body.data.token);
      assertExists(res.body.data.refreshToken);
      assertEquals(res.body.data.user.email, "gabriel.silva@example.com");
    });

    await t.step("POST /api/auth/register - Rejeita e-mail duplicado (400)", async () => {
      const res = await supertest(app)
        .post("/api/auth/register")
        .send({
          name: "Gabriel Dup",
          email: "gabriel.silva@example.com",
          password: "password123",
        });

      assertEquals(res.status, 400);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/auth/register - Rejeita requisição com campos ausentes (400)", async () => {
      const res = await supertest(app)
        .post("/api/auth/register")
        .send({
          name: "Incompleto",
        });

      assertEquals(res.status, 400);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/auth/login - Autentica usuário existente com sucesso (200)", async () => {
      const res = await supertest(app)
        .post("/api/auth/login")
        .send({
          email: "gabriel.silva@example.com",
          password: "password123",
        });

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.token);
      assertExists(res.body.data.refreshToken);
    });

    await t.step("POST /api/auth/login - Rejeita credenciais incorretas (401)", async () => {
      const res = await supertest(app)
        .post("/api/auth/login")
        .send({
          email: "gabriel.silva@example.com",
          password: "wrongPassword",
        });

      assertEquals(res.status, 401);
      assertEquals(res.body.success, false);
    });

    await t.step("GET /api/auth/me - Retorna perfil autenticado (200)", async () => {
      const { accessToken } = await createTestUser("USER", "perfil.test@example.com");

      const res = await supertest(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertEquals(res.body.data.email, "perfil.test@example.com");
    });

    await t.step("GET /api/auth/me - Rejeita requisição sem token (401)", async () => {
      const res = await supertest(app).get("/api/auth/me");

      assertEquals(res.status, 401);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/auth/refresh - Renova token de acesso com refresh token válido (200)", async () => {
      const { refreshToken } = await createTestUser("USER", "refresh.test@example.com");

      const res = await supertest(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.token);
      assertExists(res.body.data.refreshToken);
    });

    await t.step("POST /api/auth/refresh - Rejeita refresh token inválido (401)", async () => {
      const res = await supertest(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid.token.string" });

      assertEquals(res.status, 401);
      assertEquals(res.body.success, false);
    });

    await clearDatabase();
    await teardownTestDB();
  },
});
