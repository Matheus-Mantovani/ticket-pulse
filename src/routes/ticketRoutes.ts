import { Router } from "express";
import { defaultTicketController } from "../controllers/ticketController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Endpoint de compra atômica de ingressos com caminho absoluto completo
router.post("/api/tickets/purchase", authMiddleware, defaultTicketController.purchase);

// Endpoint de consulta dos ingressos do usuário autenticado com caminho absoluto completo
router.get("/api/tickets/my-tickets", authMiddleware, defaultTicketController.myTickets);

export default router;
