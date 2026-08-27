import mongoose from "mongoose";
import { ITicket } from "../models/Ticket.ts";

export interface ITicketRepository {
  createInTransaction(ticketData: Partial<ITicket>, session: mongoose.ClientSession): Promise<ITicket>;
  findByUser(userId: string): Promise<ITicket[]>;
}
