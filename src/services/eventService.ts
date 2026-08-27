import mongoose from "mongoose";
import throwlhosPkg from "throwlhos";
import {
  Event,
  EventDTO,
  EventCategory,
  EventStatus,
  toEventDTO,
} from "../models/Event.ts";

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

export async function createEventService(
  input: CreateEventInput,
  creatorId: string
): Promise<EventDTO> {
  const event = new Event({
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

  await event.save();
  return toEventDTO(event);
}

export async function getAllEventsService(
  query: ListEventsQuery
): Promise<PaginatedEventsResult> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

  const filter: Record<string, unknown> = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search && query.search.trim() !== "") {
    const searchRegex = { $regex: query.search.trim(), $options: "i" };
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    events: events.map(toEventDTO),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getEventByIdService(eventId: string): Promise<EventDTO> {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw throwlhos.err_notFound("Event not found");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw throwlhos.err_notFound("Event not found");
  }

  return toEventDTO(event);
}

export async function updateEventService(
  eventId: string,
  updateData: UpdateEventInput
): Promise<EventDTO> {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw throwlhos.err_notFound("Event not found");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw throwlhos.err_notFound("Event not found");
  }

  if (updateData.title !== undefined) event.title = updateData.title;
  if (updateData.description !== undefined) event.description = updateData.description;
  if (updateData.date !== undefined) event.date = new Date(updateData.date);
  if (updateData.location !== undefined) event.location = updateData.location;
  if (updateData.category !== undefined) event.category = updateData.category;
  if (updateData.price !== undefined) event.price = updateData.price;
  if (updateData.status !== undefined) event.status = updateData.status;

  if (updateData.totalTickets !== undefined) {
    const diff = updateData.totalTickets - event.totalTickets;
    const newAvailable = event.availableTickets + diff;
    if (newAvailable < 0) {
      throw throwlhos.err_badRequest("Cannot decrease total tickets below already sold amount");
    }
    event.totalTickets = updateData.totalTickets;
    event.availableTickets = newAvailable;
  }

  await event.save();
  return toEventDTO(event);
}

export async function deleteEventService(eventId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw throwlhos.err_notFound("Event not found");
  }

  const event = await Event.findByIdAndDelete(eventId);
  if (!event) {
    throw throwlhos.err_notFound("Event not found");
  }
}
