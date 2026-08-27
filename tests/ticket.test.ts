import { assertEquals, assertExists } from "@std/assert";
import { app, supertest, setupTestDB, teardownTestDB, clearDatabase, createTestUser } from "./helpers.ts";
import { createEventService } from "../src/services/eventService.ts";

Deno.test({
  name: "Ticket Purchase Integration Tests",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn(t) {
    await setupTestDB();
    await clearDatabase();

    let userToken: string;
    let _userId: string;
    let adminId: string;
    let testEventId: string;

    await t.step("Setup Usuários e Evento de Teste", async () => {
      const userCreds = await createTestUser("USER", "ticket.buyer@test.com");
      const adminCreds = await createTestUser("ADMIN", "ticket.admin@test.com");

      userToken = userCreds.accessToken;
      _userId = userCreds.user._id.toString();
      adminId = adminCreds.user._id.toString();

      // Criar evento de teste limitado a 1 ingresso
      const event = await createEventService(
        {
          title: "Show Exclusivo de Teste",
          description: "Apenas 1 ingresso disponível",
          date: "2026-12-31T23:59:59.000Z",
          location: "Arena VIP",
          category: "CONCERT",
          price: 300,
          totalTickets: 1,
        },
        adminId
      );

      testEventId = event.id;
    });

    await t.step("POST /api/tickets/purchase - Compra ingresso com sucesso (201)", async () => {
      const res = await supertest(app)
        .post("/api/tickets/purchase")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ eventId: testEventId });

      assertEquals(res.status, 201);
      assertEquals(res.body.success, true);
      assertExists(res.body.data.id);
      assertExists(res.body.data.ticketCode);
      assertEquals(res.body.data.eventId, testEventId);
    });

    await t.step("GET /api/tickets/my-tickets - Retorna ingressos do usuário (200)", async () => {
      const res = await supertest(app)
        .get("/api/tickets/my-tickets")
        .set("Authorization", `Bearer ${userToken}`);

      assertEquals(res.status, 200);
      assertEquals(res.body.success, true);
      assertEquals(res.body.data.length, 1);
    });

    await t.step("POST /api/tickets/purchase - Rejeita compra em evento esgotado (400)", async () => {
      const res = await supertest(app)
        .post("/api/tickets/purchase")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ eventId: testEventId });

      assertEquals(res.status, 400);
      assertEquals(res.body.success, false);
      assertEquals(res.body.message, "Tickets sold out");
    });

    await t.step("POST /api/tickets/purchase - Rejeita compra sem token (401)", async () => {
      const res = await supertest(app)
        .post("/api/tickets/purchase")
        .send({ eventId: testEventId });

      assertEquals(res.status, 401);
      assertEquals(res.body.success, false);
    });

    await t.step("POST /api/tickets/purchase - Rejeita evento inexistente (404)", async () => {
      const fakeEventId = "609052d091e0c48fa44184f9";
      const res = await supertest(app)
        .post("/api/tickets/purchase")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ eventId: fakeEventId });

      assertEquals(res.status, 404);
      assertEquals(res.body.success, false);
    });

    await clearDatabase();
    await teardownTestDB();
  },
});
