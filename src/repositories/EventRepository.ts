import { Event, IEvent } from "../models/Event.ts";
import {
  IEventRepository,
  EventFilter,
  PaginationOptions,
  PaginatedEvents,
} from "./IEventRepository.ts";

export class EventRepository implements IEventRepository {
  async create(eventData: Partial<IEvent>): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  async findAll(
    filter: EventFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedEvents> {
    const query: Record<string, unknown> = { status: "ACTIVE" };

    if (filter.search) {
      query.title = { $regex: filter.search, $options: "i" };
    }

    if (filter.category) {
      query.category = filter.category;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [events, total] = await Promise.all([
      Event.find(query).skip(skip).limit(pagination.limit).sort({ date: 1 }),
      Event.countDocuments(query),
    ]);

    return { events, total };
  }

  async findById(id: string): Promise<IEvent | null> {
    return await Event.findById(id);
  }

  async update(id: string, eventData: Partial<IEvent>): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(id, eventData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Event.findByIdAndDelete(id);
    return result !== null;
  }
}
