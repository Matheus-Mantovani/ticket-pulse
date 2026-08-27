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
  create(eventData: Partial<IEvent>): Promise<IEvent>;
  findAll(filter: EventFilter, pagination: PaginationOptions): Promise<PaginatedEvents>;
  findById(id: string): Promise<IEvent | null>;
  update(id: string, eventData: Partial<IEvent>): Promise<IEvent | null>;
  delete(id: string): Promise<boolean>;
}
