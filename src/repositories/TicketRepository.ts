import { Query, ClientSession } from "mongoose";
import { TicketModel, ITicket } from "../models/Ticket.ts";
import { BaseRepository } from "./BaseRepository.ts";
import { ITicketRepository } from "./ITicketRepository.ts";

export class TicketRepository
  extends BaseRepository<ITicket>
  implements ITicketRepository
{
  constructor() {
    super(TicketModel);
  }

  createInTransaction(
    ticketData: Partial<ITicket>,
    session: ClientSession
  ): Promise<ITicket> {
    return this.createOne(ticketData, session);
  }

  findByUser(userId: string): Query<ITicket[], ITicket> {
    return this.find({ user: userId }).populate("event").sort({ purchasedAt: -1 });
  }
}
