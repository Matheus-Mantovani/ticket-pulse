import { Query, ClientSession } from "mongoose";
import { IEvent } from "../models/Event.ts";

export interface EventFilter {
  search?: string;
  category?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedEvents {
  events: IEvent[];
  total: number;
}

export interface IEventRepository {
  create(eventData: Partial<IEvent>, session?: ClientSession): Promise<IEvent>;
  findAll(
    filter: EventFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedEvents>;
  findById(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent>;
  update(
    id: string,
    eventData: Partial<IEvent>,
    session?: ClientSession
  ): Query<IEvent | null, IEvent>;
  delete(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent>;
}
