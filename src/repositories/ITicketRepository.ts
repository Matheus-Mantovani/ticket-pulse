import { Query, ClientSession } from "mongoose";
import { ITicket } from "../models/Ticket.ts";

export interface ITicketRepository {
  createInTransaction(
    ticketData: Partial<ITicket>,
    session: ClientSession
  ): Promise<ITicket>;
  // [TEMPORÁRIO - REMOVER NA ETAPA 6] União | Promise para compatibilidade com mocks de teste legados
  findByUser(userId: string): Query<ITicket[], ITicket> | Promise<ITicket[]>;
}
