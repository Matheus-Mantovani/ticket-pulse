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
import * as eventService from "../services/eventService.ts";

const throwlhos = throwlhosPkg.default || throwlhosPkg;

export async function createEventController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.id) {
      throw throwlhos.err_unauthorized("Authentication required");
    }

    const { title, description, date, location, category, price, totalTickets } =
      req.body;

    checkRequiredFields({ title, date, location, price, totalTickets });
    validateString(title, "title");
    validateString(location, "location");
    validateFutureDate(date, "date");
    validatePositiveNumber(price, "price");
    validatePositiveNumber(totalTickets, "totalTickets");

    if (Number(totalTickets) < 1) {
      throw throwlhos.err_badRequest("totalTickets must be at least 1");
    }

    const event = await eventService.createEventService(
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
}

export async function getAllEventsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await eventService.getAllEventsService(req.query);

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
}

export async function getEventByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const event = await eventService.getEventByIdService(id);

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
}

export async function updateEventController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    const updatedEvent = await eventService.updateEventService(id, req.body);

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
}

export async function deleteEventController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await eventService.deleteEventService(id);

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
}
