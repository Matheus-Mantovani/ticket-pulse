import { Request, Response, NextFunction } from "express";
import throwlhosPkg from "throwlhos";
import { checkRequiredFields } from "../utils/validation.ts";
import { ResponserResponse } from "../utils/response.ts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import { TicketService } from "../services/ticketService.ts";
import { ITicketRepository } from "../repositories/ITicketRepository.ts";
import { TicketRepository } from "../repositories/TicketRepository.ts";
import { IEventRepository } from "../repositories/IEventRepository.ts";
import { EventRepository } from "../repositories/EventRepository.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export class TicketController {
  private ticketService: TicketService;

  constructor(
    ticketRepo: ITicketRepository = new TicketRepository(),
    eventRepo: IEventRepository = new EventRepository()
  ) {
    this.ticketService = new TicketService(ticketRepo, eventRepo);
  }

  purchaseTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.id) {
        throw throwlhos.err_unauthorized("Authentication required");
      }

      const { eventId } = req.body;
      checkRequiredFields({ eventId });

      const ticket = await this.ticketService.purchaseTicketService(
        eventId,
        authReq.user.id
      );

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_created === "function") {
        resRes.send_created("Ticket purchased successfully", ticket);
      } else {
        res.status(201).json({
          status: "CREATED",
          code: 201,
          success: true,
          message: "Ticket purchased successfully",
          data: ticket,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  getUserTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.id) {
        throw throwlhos.err_unauthorized("Authentication required");
      }

      const tickets = await this.ticketService.getUserTicketsService(authReq.user.id);

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_ok === "function") {
        resRes.send_ok("User tickets retrieved successfully", tickets);
      } else {
        res.status(200).json({
          status: "OK",
          code: 200,
          success: true,
          message: "User tickets retrieved successfully",
          data: tickets,
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

export const defaultTicketController = new TicketController();
