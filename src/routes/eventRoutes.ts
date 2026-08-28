import { Router } from "express";
import { defaultEventController } from "../controllers/eventController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

// Rotas públicas de consulta com caminhos absolutos completos
router.get("/api/events", defaultEventController.list);
router.get("/api/events/:id", defaultEventController.getById);

// Rotas protegidas restritas exclusivamente a Administradores (ADMIN) com caminhos absolutos completos
router.post("/api/events", authMiddleware, requireRole("ADMIN"), defaultEventController.create);
router.put("/api/events/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.update);
router.delete("/api/events/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.delete);

export default router;
