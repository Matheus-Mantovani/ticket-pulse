import { Router } from "express";
import { defaultTicketController } from "../controllers/ticketController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Endpoint de compra atômica de ingressos (Protegido por JWT)
router.post("/purchase", authMiddleware, defaultTicketController.purchaseTicket);

// Endpoint de consulta dos ingressos do usuário autenticado (Protegido por JWT)
router.get("/my-tickets", authMiddleware, defaultTicketController.getUserTickets);

export default router;
