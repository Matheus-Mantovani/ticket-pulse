import mongoose from "mongoose";
import { Ticket, ITicket } from "../models/Ticket.ts";
import { ITicketRepository } from "./ITicketRepository.ts";

export class TicketRepository implements ITicketRepository {
  async createInTransaction(
    ticketData: Partial<ITicket>,
    session: mongoose.ClientSession
  ): Promise<ITicket> {
    const [ticket] = await Ticket.create([ticketData], { session });
    return ticket;
  }

  async findByUser(userId: string): Promise<ITicket[]> {
    return await Ticket.find({ user: userId }).populate("event").sort({ purchasedAt: -1 });
  }
}
