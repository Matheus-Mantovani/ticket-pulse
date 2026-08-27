import { Request, Response, NextFunction } from "express";
import throwlhosPkg from "throwlhos";
import {
  checkRequiredFields,
  validateString,
  validateFutureDate,
  validatePositiveNumber,
} from "../utils/validation.ts";
import { ResponserResponse } from "../utils/response.ts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import { EventService } from "../services/eventService.ts";
import { IEventRepository } from "../repositories/IEventRepository.ts";
import { EventRepository } from "../repositories/EventRepository.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export class EventController {
  private eventService: EventService;

  constructor(eventRepo: IEventRepository = new EventRepository()) {
    this.eventService = new EventService(eventRepo);
  }

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.id) {
        throw throwlhos.err_unauthorized("Authentication required");
      }

      const { title, description, date, location, category, price, totalTickets } = req.body;

      checkRequiredFields({ title, date, location, price, totalTickets });
      validateString(title, "title");
      validateString(location, "location");
      validateFutureDate(date, "date");
      validatePositiveNumber(price, "price");
      validatePositiveNumber(totalTickets, "totalTickets");

      if (Number(totalTickets) < 1) {
        throw throwlhos.err_badRequest("totalTickets must be at least 1");
      }

      const event = await this.eventService.createEventService(
        {
          title,
          description,
          date,
          location,
          category,
          price: Number(price),
          totalTickets: Number(totalTickets),
        },
        authReq.user.id
      );

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_created === "function") {
        resRes.send_created("Event created successfully", event);
      } else {
        res.status(201).json({
          status: "CREATED",
          code: 201,
          success: true,
          message: "Event created successfully",
          data: event,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.getAllEventsService(req.query);

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_ok === "function") {
        resRes.send_ok("Events retrieved successfully", result);
      } else {
        res.status(200).json({
          status: "OK",
          code: 200,
          success: true,
          message: "Events retrieved successfully",
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventByIdService(id);

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_ok === "function") {
        resRes.send_ok("Event retrieved successfully", event);
      } else {
        res.status(200).json({
          status: "OK",
          code: 200,
          success: true,
          message: "Event retrieved successfully",
          data: event,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, date, price, totalTickets } = req.body;

      if (title !== undefined) validateString(title, "title");
      if (date !== undefined) validateFutureDate(date, "date");
      if (price !== undefined) validatePositiveNumber(price, "price");
      if (totalTickets !== undefined) {
        validatePositiveNumber(totalTickets, "totalTickets");
        if (Number(totalTickets) < 1) {
          throw throwlhos.err_badRequest("totalTickets must be at least 1");
        }
      }

      const updatedEvent = await this.eventService.updateEventService(id, req.body);

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_ok === "function") {
        resRes.send_ok("Event updated successfully", updatedEvent);
      } else {
        res.status(200).json({
          status: "OK",
          code: 200,
          success: true,
          message: "Event updated successfully",
          data: updatedEvent,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.eventService.deleteEventService(id);

      const resRes = res as ResponserResponse;
      if (typeof resRes.send_ok === "function") {
        resRes.send_ok("Event deleted successfully");
      } else {
        res.status(200).json({
          status: "OK",
          code: 200,
          success: true,
          message: "Event deleted successfully",
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

export const defaultEventController = new EventController();
