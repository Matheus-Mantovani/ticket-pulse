import mongoose from "mongoose";
import throwlhosPkg from "throwlhos";
import { EventModel } from "../models/Event.ts";
import { TicketDTO, toTicketDTO } from "../models/Ticket.ts";
import { ITicketRepository } from "../repositories/ITicketRepository.ts";
import { TicketRepository } from "../repositories/TicketRepository.ts";
import { IEventRepository } from "../repositories/IEventRepository.ts";
import { EventRepository } from "../repositories/EventRepository.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export class TicketService {
  constructor(
    private ticketRepo: ITicketRepository = new TicketRepository(),
    private eventRepo: IEventRepository = new EventRepository()
  ) {}

  async purchaseTicketService(
    eventId: string,
    userId: string
  ): Promise<TicketDTO> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw throwlhos.err_notFound("Event not found");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const event = await EventModel.findById(eventId).session(session);
      if (!event) {
        throw throwlhos.err_notFound("Event not found");
      }

      if (event.status !== "ACTIVE") {
        throw throwlhos.err_badRequest("Event is not active for ticket purchase");
      }

      if (event.availableTickets <= 0) {
        throw throwlhos.err_badRequest("Tickets sold out");
      }

      event.availableTickets -= 1;
      await event.save({ session });

      const randomHash = crypto.randomUUID().substring(0, 8).toUpperCase();
      const ticketCode = `TCK-${randomHash}`;

      const ticket = await this.ticketRepo.createInTransaction(
        {
          event: event._id,
          user: new mongoose.Types.ObjectId(userId),
          ticketCode,
          purchasePrice: event.price,
          purchasedAt: new Date(),
        },
        session
      );

      await session.commitTransaction();

      return toTicketDTO(ticket);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getUserTicketsService(userId: string): Promise<TicketDTO[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw throwlhos.err_badRequest("Invalid user ID");
    }

    const tickets = await this.ticketRepo.findByUser(userId);
    return tickets.map(toTicketDTO);
  }
}

export const defaultTicketService = new TicketService();
