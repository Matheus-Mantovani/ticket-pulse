import { Router } from "express";
import { defaultEventController } from "../controllers/eventController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

// Rotas públicas de consulta
router.get("/", defaultEventController.getAllEvents);
router.get("/:id", defaultEventController.getEventById);

// Rotas protegidas restritas exclusivamente a Administradores (ADMIN)
router.post("/", authMiddleware, requireRole("ADMIN"), defaultEventController.createEvent);
router.put("/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.updateEvent);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.deleteEvent);

export default router;
