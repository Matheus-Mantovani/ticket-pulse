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
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  findById(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> | Promise<IEvent | null>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  update(
    id: string,
    eventData: Partial<IEvent>,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> | Promise<IEvent | null>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  delete(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> | Promise<IEvent | null> | Promise<boolean>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] Método opcional para compatibilidade com mocks de teste legados
  decrementAvailableTickets?(
    id: string,
    session?: ClientSession
  ): Query<IEvent | null, IEvent> | Promise<IEvent | null>;
}
