import { assertEquals, assertExists } from "jsr:@std/assert";
import { app, supertest, setupTestDB, teardownTestDB, clearDatabase, createTestUser } from "./helpers.ts";

Deno.test({
  name: "Event Endpoints Integration Tests",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn(t) {
    await setupTestDB();
    await clearDatabase();

    let adminToken: string;
    let userToken: string;
    let createdEventId: string;

    await t.step("Setup Usuários de Teste", async () => {
      const adminCreds = await createTestUser("ADMIN", "admin.event@test.com");
      const userCreds = await createTestUser("USER", "user.event@test.com");
      adminToken = adminCreds.accessToken;
      userToken = userCreds.accessToken;
    });

    await t.step("POST /api/events - Cria evento com sucesso como ADMIN (201)", async () => {
      const res = await supertest(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "DevConf Brasil 2026",
          description: "Conferência de desenvolvimento",
          date: "2026-11-20T10:00:00.000Z",
          location: "Centro de Convenções",
          category: "CONFERENCE",
          price: 200,
          totalTickets: 100,
        });

      assertEquals(res.status, 201);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.id);
      assertEquals(res.body.data.availableTickets, 100);
      createdEventId = res.body.data.id;
    });

    await t.step("POST /api/events - Rejeita criação por usuário USER comum (403)", async () => {
      const res = await supertest(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Evento Proibido",
          date: "2026-12-01T20:00:00.000Z",
          location: "Teatro",
          price: 50,
          totalTickets: 10,
        });

      assertEquals(res.status, 403);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/events - Rejeita criação sem autenticação (401)", async () => {
      const res = await supertest(app)
        .post("/api/events")
        .send({
          title: "Evento Sem Token",
          date: "2026-12-01T20:00:00.000Z",
          location: "Teatro",
          price: 50,
          totalTickets: 10,
        });

      assertEquals(res.status, 401);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/events - Rejeita data no passado (400)", async () => {
      const res = await supertest(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Evento Passado",
          date: "2020-01-01T10:00:00.000Z",
          location: "Local",
          price: 100,
          totalTickets: 50,
        });

      assertEquals(res.status, 400);
      assertEquals(res.body.success, false);
    });

    await t.step("GET /api/events - Retorna lista paginada de eventos públicos (200)", async () => {
      const res = await supertest(app).get("/api/events?search=DevConf");

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.events);
      assertEquals(res.body.data.events.length, 1);
    });

    await t.step("GET /api/events/:id - Retorna detalhes do evento (200)", async () => {
      const res = await supertest(app).get(`/api/events/${createdEventId}`);

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertEquals(res.body.data.id, createdEventId);
    });

    await t.step("GET /api/events/:id - Retorna 404 para ID inexistente", async () => {
      const fakeId = "609052d091e0c48fa44184f9";
      const res = await supertest(app).get(`/api/events/${fakeId}`);

      assertEquals(res.status, 404);
      assertEquals(res.body.success, false);
    });

    await t.step("PUT /api/events/:id - Atualiza evento como ADMIN (200)", async () => {
      const res = await supertest(app)
        .put(`/api/events/${createdEventId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          price: 250,
          totalTickets: 150,
        });

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertEquals(res.body.data.price, 250);
      assertEquals(res.body.data.totalTickets, 150);
      assertEquals(res.body.data.availableTickets, 150);
    });

    await t.step("DELETE /api/events/:id - Remove evento como ADMIN (200)", async () => {
      const res = await supertest(app)
        .delete(`/api/events/${createdEventId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
    });

    await clearDatabase();
    await teardownTestDB();
  },
});
