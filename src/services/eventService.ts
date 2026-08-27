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

export interface CreateEventInput {
  title: string;
  description?: string;
  date: Date | string;
  location: string;
  category?: EventCategory;
  price: number;
  totalTickets: number;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: Date | string;
  location?: string;
  category?: EventCategory;
  price?: number;
  totalTickets?: number;
  status?: EventStatus;
}

export interface ListEventsQuery {
  page?: number | string;
  limit?: number | string;
  category?: EventCategory;
  status?: EventStatus;
  search?: string;
}

export interface PaginatedEventsResult {
  events: EventDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class EventService {
  constructor(private eventRepo: IEventRepository = new EventRepository()) {}

  async createEventService(
    input: CreateEventInput,
    creatorId: string
  ): Promise<EventDTO> {
    const event = await this.eventRepo.create({
      title: input.title,
      description: input.description || "",
      date: new Date(input.date),
      location: input.location,
      category: input.category || "OTHER",
      price: input.price,
      totalTickets: input.totalTickets,
      availableTickets: input.totalTickets,
      status: "ACTIVE",
      createdBy: new mongoose.Types.ObjectId(creatorId),
    });

    return toEventDTO(event);
  }

  async getAllEventsService(
    query: ListEventsQuery
  ): Promise<PaginatedEventsResult> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const { events, total } = await this.eventRepo.findAll(
      {
        search: query.search,
        category: query.category,
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

  async getEventByIdService(eventId: string): Promise<EventDTO> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw throwlhos.err_notFound("Event not found");
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw throwlhos.err_notFound("Event not found");
    }

    return toEventDTO(event);
  }

  async updateEventService(
    eventId: string,
    updateData: UpdateEventInput
  ): Promise<EventDTO> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw throwlhos.err_notFound("Event not found");
    }

    const existingEvent = await this.eventRepo.findById(eventId);
    if (!existingEvent) {
      throw throwlhos.err_notFound("Event not found");
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
        throw throwlhos.err_badRequest("Cannot decrease total tickets below already sold amount");
      }
      updatePayload.totalTickets = updateData.totalTickets;
      updatePayload.availableTickets = newAvailable;
    }

    const updatedEvent = await this.eventRepo.update(eventId, updatePayload);
    if (!updatedEvent) {
      throw throwlhos.err_notFound("Event not found");
    }

    return toEventDTO(updatedEvent);
  }

  async deleteEventService(eventId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw throwlhos.err_notFound("Event not found");
    }

    const deleted = await this.eventRepo.delete(eventId);
    if (!deleted) {
      throw throwlhos.err_notFound("Event not found");
    }
  }
}

export const defaultEventService = new EventService();

export const createEventService = (input: CreateEventInput, creatorId: string) =>
  defaultEventService.createEventService(input, creatorId);
export const getAllEventsService = (query: ListEventsQuery) =>
  defaultEventService.getAllEventsService(query);
export const getEventByIdService = (eventId: string) =>
  defaultEventService.getEventByIdService(eventId);
export const updateEventService = (eventId: string, updateData: UpdateEventInput) =>
  defaultEventService.updateEventService(eventId, updateData);
export const deleteEventService = (eventId: string) =>
  defaultEventService.deleteEventService(eventId);
