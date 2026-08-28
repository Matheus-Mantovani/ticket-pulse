import mongoose from "mongoose";
import throwlhosPkg from "throwlhos";
import {
  EventDTO,
  EventCategory,
  EventStatus,
  toEventDTO,
} from "../models/Event.ts";
import { IEventRepository } from "../repositories/IEventRepository.ts";
import { EventRepository } from "../repositories/EventRepository.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export namespace EventService {
  export namespace CreateEvent {
    export type Input = {
      input: {
        title: string;
        description?: string;
        date: Date | string;
        location: string;
        category?: EventCategory;
        price: number;
        totalTickets: number;
        creatorId: string;
      };
    };
    export type Output = EventDTO;
  }

  export namespace UpdateEvent {
    export type Input = {
      input: {
        id: string;
        data: {
          title?: string;
          description?: string;
          date?: Date | string;
          location?: string;
          category?: EventCategory;
          price?: number;
          totalTickets?: number;
          status?: EventStatus;
        };
      };
    };
    export type Output = EventDTO;
  }

  export namespace DeleteEvent {
    export type Input = {
      input: {
        id: string;
      };
    };
    export type Output = { success: boolean };
  }

  export namespace GetEventById {
    export type Input = {
      input: {
        id: string;
      };
    };
    export type Output = EventDTO;
  }

  export namespace ListEvents {
    export type Input = {
      input: {
        page?: number | string;
        limit?: number | string;
        category?: EventCategory;
        status?: EventStatus;
        search?: string;
      };
    };
    export type Output = {
      events: EventDTO[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}

export class EventService {
  constructor(private eventRepo: IEventRepository = new EventRepository()) {}

  async createEvent(
    params: EventService.CreateEvent.Input
  ): Promise<EventService.CreateEvent.Output> {
    const { title, description, date, location, category, price, totalTickets, creatorId } =
      params.input;

    const event = await this.eventRepo.create({
      title,
      description: description || "",
      date: new Date(date),
      location,
      category: category || "OTHER",
      price,
      totalTickets,
      availableTickets: totalTickets,
      status: "ACTIVE",
      createdBy: new mongoose.Types.ObjectId(creatorId),
    });

    return toEventDTO(event);
  }

  async listEvents(
    params: EventService.ListEvents.Input
  ): Promise<EventService.ListEvents.Output> {
    const { page: pageInput, limit: limitInput, search, category } = params.input;
    const page = Math.max(1, Number(pageInput) || 1);
    const limit = Math.max(1, Math.min(100, Number(limitInput) || 10));

    const { events, total } = await this.eventRepo.findAll(
      {
        search,
        category,
      },
      { page, limit }
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      events: events.map(toEventDTO),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getEventById(
    params: EventService.GetEventById.Input
  ): Promise<EventService.GetEventById.Output> {
    const { id } = params.input;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    const event = await this.eventRepo.findById(id);
    if (!event) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    return toEventDTO(event);
  }

  async updateEvent(
    params: EventService.UpdateEvent.Input
  ): Promise<EventService.UpdateEvent.Output> {
    const { id, data: updateData } = params.input;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    const updatePayload: Record<string, unknown> = {};

    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.date !== undefined) updatePayload.date = new Date(updateData.date);
    if (updateData.location !== undefined) updatePayload.location = updateData.location;
    if (updateData.category !== undefined) updatePayload.category = updateData.category;
    if (updateData.price !== undefined) updatePayload.price = updateData.price;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;

    if (updateData.totalTickets !== undefined) {
      const diff = updateData.totalTickets - existingEvent.totalTickets;
      const newAvailable = existingEvent.availableTickets + diff;
      if (newAvailable < 0) {
        throw throwlhos.err_badRequest(
          "Cannot decrease total tickets below already sold amount",
          { id, totalTickets: updateData.totalTickets }
        );
      }
      updatePayload.totalTickets = updateData.totalTickets;
      updatePayload.availableTickets = newAvailable;
    }

    const updatedEvent = await this.eventRepo.update(id, updatePayload);
    if (!updatedEvent) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    return toEventDTO(updatedEvent);
  }

  async deleteEvent(
    params: EventService.DeleteEvent.Input
  ): Promise<EventService.DeleteEvent.Output> {
    const { id } = params.input;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    const deleted = await this.eventRepo.delete(id);
    if (!deleted) {
      throw throwlhos.err_notFound("Event not found", { id });
    }

    return { success: true };
  }
}
