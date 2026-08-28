import { Query, ClientSession } from "mongoose";
import { EventModel, IEvent } from "../models/Event.ts";
import { BaseRepository } from "./BaseRepository.ts";
import {
  IEventRepository,
  EventFilter,
  PaginationOptions,
  PaginatedEvents,
} from "./IEventRepository.ts";

export class EventRepository
  extends BaseRepository<IEvent>
  implements IEventRepository
{
  constructor() {
    super(EventModel);
  }

  create(eventData: Partial<IEvent>, session?: ClientSession): Promise<IEvent> {
    return this.createOne(eventData, session);
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
      this.find(query).skip(skip).limit(pagination.limit).sort({ date: 1 }),
      this.countDocuments(query),
    ]);

    return { events, total };
  }

  update(
    id: string,
    eventData: Partial<IEvent>,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> {
    return this.updateById(id, eventData, session);
  }

  delete(id: string, session?: ClientSession): Query<IEvent | null, IEvent> {
    return this.deleteById(id, session);
  }

  decrementAvailableTickets(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> {
    return this.updateById(id, { $inc: { availableTickets: -1 } }, session);
  }
}
