import mongoose from "mongoose";
import throwlhosPkg from "throwlhos";
import { Event } from "../models/Event.ts";
import { Ticket, TicketDTO, toTicketDTO } from "../models/Ticket.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

/**
 * Realiza a compra atômica de um ingresso executando uma transação ACID no MongoDB Atlas.
 * Altera concorrentemente o evento (decrementando estoque) e registra o Ticket.
 */
export async function purchaseTicketService(
  eventId: string,
  userId: string
): Promise<TicketDTO> {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw throwlhos.err_notFound("Event not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw throwlhos.err_notFound("Event not found");
    }

    if (event.status !== "ACTIVE") {
      throw throwlhos.err_badRequest("Event is not active for ticket purchase");
    }

    if (event.availableTickets <= 0) {
      throw throwlhos.err_badRequest("Tickets sold out");
    }

    // Decrementa o estoque de ingressos disponíveis
    event.availableTickets -= 1;
    await event.save({ session });

    // Gera um código de ingresso único
    const randomHash = crypto.randomUUID().substring(0, 8).toUpperCase();
    const ticketCode = `TCK-${randomHash}`;

    // Cria o documento de ingresso dentro da mesma sessão transacional
    const ticket = new Ticket({
      event: event._id,
      user: new mongoose.Types.ObjectId(userId),
      ticketCode,
      purchasePrice: event.price,
      purchasedAt: new Date(),
    });

    await ticket.save({ session });

    // Commit da transação ACID no MongoDB Atlas
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

/**
 * Consulta a lista de ingressos comprados por um determinado usuário.
 */
export async function getUserTicketsService(userId: string): Promise<TicketDTO[]> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw throwlhos.err_badRequest("Invalid user ID");
  }

  const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });
  return tickets.map(toTicketDTO);
}
