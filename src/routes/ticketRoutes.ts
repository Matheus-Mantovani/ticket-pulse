import { Router } from "express";
import {
  purchaseTicketController,
  getUserTicketsController,
} from "../controllers/ticketController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Endpoint de compra atômica de ingressos (Protegido por JWT)
router.post("/purchase", authMiddleware, purchaseTicketController);

// Endpoint de consulta dos ingressos do usuário autenticado (Protegido por JWT)
router.get("/my-tickets", authMiddleware, getUserTicketsController);

export default router;
