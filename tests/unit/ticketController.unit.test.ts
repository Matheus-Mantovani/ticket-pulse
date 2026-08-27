import { assertEquals, assertExists } from "@std/assert";
import mongoose from "mongoose";
import { TicketController } from "../../src/controllers/ticketController.ts";
import { ITicketRepository } from "../../src/repositories/ITicketRepository.ts";
import { IEventRepository } from "../../src/repositories/IEventRepository.ts";
import { ITicket } from "../../src/models/Ticket.ts";
import { IEvent } from "../../src/models/Event.ts";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./mockExpress.ts";

function createMockTicketRepo(overrides: Partial<ITicketRepository> = {}): ITicketRepository {
  return {
    createInTransaction: (data: Partial<ITicket>) =>
      Promise.resolve({
        _id: "mock_ticket_id_123",
        event: data.event,
        user: data.user,
        ticketCode: data.ticketCode || "TCK-12345678",
        purchasePrice: data.purchasePrice || 100,
        purchasedAt: data.purchasedAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ITicket),
    findByUser: () => Promise.resolve([]),
    ...overrides,
  };
}

function createMockEventRepo(overrides: Partial<IEventRepository> = {}): IEventRepository {
  return {
    create: () => Promise.resolve({} as unknown as IEvent),
    findAll: () => Promise.resolve({ events: [], total: 0 }),
    findById: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(true),
    ...overrides,
  };
}

Deno.test("TicketController Unit Tests", async (t) => {
  await t.step("GET /api/tickets/my-tickets - Retorna lista de ingressos do usuário", async () => {
    const validUserId = "507f1f77bcf86cd799439012";

    const mockTicketRepo = createMockTicketRepo({
      findByUser: (userId: string) => {
        assertEquals(userId, validUserId);
        return Promise.resolve([
          {
            _id: "507f1f77bcf86cd799439088",
            event: new mongoose.Types.ObjectId("507f1f77bcf86cd799439099") as unknown as mongoose.Types.ObjectId,
            user: new mongoose.Types.ObjectId(validUserId) as unknown as mongoose.Types.ObjectId,
            ticketCode: "TCK-ABC12345",
            purchasePrice: 200,
            purchasedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as ITicket,
        ]);
      },
    });

    const mockEventRepo = createMockEventRepo();

    const controller = new TicketController(mockTicketRepo, mockEventRepo);

    const req = createMockRequest({
      user: { id: validUserId, email: "user@test.com", role: "USER" },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.getUserTickets(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 200);
    assertExists(data);
    const result = data as Array<{ ticketCode: string }>;
    assertEquals(result.length, 1);
    assertEquals(result[0].ticketCode, "TCK-ABC12345");
  });
});
