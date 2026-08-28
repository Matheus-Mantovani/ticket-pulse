import mongoose from "mongoose";
import { TicketModel, ITicket } from "../models/Ticket.ts";
import { ITicketRepository } from "./ITicketRepository.ts";

export class TicketRepository implements ITicketRepository {
  async createInTransaction(
    ticketData: Partial<ITicket>,
    session: mongoose.ClientSession
  ): Promise<ITicket> {
    const [ticket] = await TicketModel.create([ticketData], { session });
    return ticket;
  }

  async findByUser(userId: string): Promise<ITicket[]> {
    return await TicketModel.find({ user: userId }).populate("event").sort({ purchasedAt: -1 });
  }
}
