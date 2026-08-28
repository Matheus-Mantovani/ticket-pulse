import { Query, ClientSession } from "mongoose";
import { ITicket } from "../models/Ticket.ts";

export interface ITicketRepository {
  createInTransaction(
    ticketData: Partial<ITicket>,
    session: ClientSession
  ): Promise<ITicket>;
  findByUser(userId: string): Query<ITicket[], ITicket>;
}
