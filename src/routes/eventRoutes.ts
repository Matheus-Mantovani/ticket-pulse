import { Router } from "express";
import {
  createEventController,
  getAllEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
} from "../controllers/eventController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

// Rotas públicas de consulta
router.get("/", getAllEventsController);
router.get("/:id", getEventByIdController);

// Rotas protegidas restritas exclusivamente a Administradores (ADMIN)
router.post("/", authMiddleware, requireRole("ADMIN"), createEventController);
router.put("/:id", authMiddleware, requireRole("ADMIN"), updateEventController);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteEventController);

export default router;
