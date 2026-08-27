import { assertEquals, assertExists } from "@std/assert";
import { EventController } from "../../src/controllers/eventController.ts";
import { IEventRepository } from "../../src/repositories/IEventRepository.ts";
import { IEvent } from "../../src/models/Event.ts";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./mockExpress.ts";

function createMockEventRepo(overrides: Partial<IEventRepository> = {}): IEventRepository {
  return {
    create: (data: Partial<IEvent>) =>
      Promise.resolve({
        _id: "507f1f77bcf86cd799439099",
        title: data.title || "Evento Teste",
        description: data.description || "",
        date: data.date || new Date(),
        location: data.location || "SP",
        category: data.category || "OTHER",
        price: data.price || 100,
        totalTickets: data.totalTickets || 50,
        availableTickets: data.availableTickets || 50,
        status: data.status || "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IEvent),
    findAll: () => Promise.resolve({ events: [], total: 0 }),
    findById: (_id: string) => Promise.resolve(null),
    update: (_id: string, _data: Partial<IEvent>) => Promise.resolve(null),
    delete: (_id: string) => Promise.resolve(true),
    ...overrides,
  };
}

Deno.test("EventController Unit Tests", async (t) => {
  await t.step("POST /api/events - Cria evento no controller com sucesso", async () => {
    const mockRepo = createMockEventRepo({
      create: (data: Partial<IEvent>) => {
        assertEquals(data.title, "Rock in Rio 2026");
        assertEquals(data.price, 350);
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439099",
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          category: data.category,
          price: data.price,
          totalTickets: data.totalTickets,
          availableTickets: data.totalTickets,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IEvent);
      },
    });

    const controller = new EventController(mockRepo);

    const req = createMockRequest({
      user: { id: "507f1f77bcf86cd799439011", email: "admin@test.com", role: "ADMIN" },
      body: {
        title: "Rock in Rio 2026",
        description: "Festival de Musica",
        date: "2026-11-20T20:00:00.000Z",
        location: "Rio de Janeiro, RJ",
        category: "CONCERT",
        price: 350,
        totalTickets: 1000,
      },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.createEvent(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 201);
    assertExists(data);
    const result = data as { title: string; price: number };
    assertEquals(result.title, "Rock in Rio 2026");
    assertEquals(result.price, 350);
  });

  await t.step("GET /api/events - Lista eventos com paginação", async () => {
    const mockEvents: IEvent[] = [
      {
        _id: "507f1f77bcf86cd799439099",
        title: "Evento A",
        description: "",
        date: new Date(),
        location: "SP",
        category: "CONCERT",
        price: 100,
        totalTickets: 50,
        availableTickets: 50,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IEvent,
    ];

    const mockRepo = createMockEventRepo({
      findAll: (_filter, pagination) => {
        assertEquals(pagination.page, 1);
        assertEquals(pagination.limit, 10);
        return Promise.resolve({ events: mockEvents, total: 1 });
      },
    });

    const controller = new EventController(mockRepo);

    const req = createMockRequest({
      query: { page: "1", limit: "10" },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.getAllEvents(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 200);
    assertExists(data);
    const result = data as { total: number; events: unknown[] };
    assertEquals(result.total, 1);
    assertEquals(result.events.length, 1);
  });

  await t.step("GET /api/events/:id - Retorna detalhes do evento por ID", async () => {
    const validObjectId = "507f1f77bcf86cd799439099";

    const mockRepo = createMockEventRepo({
      findById: (id: string) => {
        assertEquals(id, validObjectId);
        return Promise.resolve({
          _id: validObjectId,
          title: "Evento Encontrado",
          description: "Desc",
          date: new Date(),
          location: "SP",
          category: "CONCERT",
          price: 150,
          totalTickets: 100,
          availableTickets: 100,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IEvent);
      },
    });

    const controller = new EventController(mockRepo);

    const req = createMockRequest({
      params: { id: validObjectId },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.getEventById(req, res, next);

    const { statusCode, data } = getMockData();
    assertEquals(statusCode, 200);
    assertExists(data);
    const result = data as { title: string };
    assertEquals(result.title, "Evento Encontrado");
  });

  await t.step("DELETE /api/events/:id - Deleta evento existente por ID", async () => {
    const validObjectId = "507f1f77bcf86cd799439099";

    const mockRepo = createMockEventRepo({
      delete: (id: string) => {
        assertEquals(id, validObjectId);
        return Promise.resolve(true);
      },
    });

    const controller = new EventController(mockRepo);

    const req = createMockRequest({
      params: { id: validObjectId },
    });
    const { res, getMockData } = createMockResponse();
    const { next } = createMockNext();

    await controller.deleteEvent(req, res, next);

    const { statusCode } = getMockData();
    assertEquals(statusCode, 200);
  });
});
