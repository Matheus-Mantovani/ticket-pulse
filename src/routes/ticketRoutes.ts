import { Router } from "express";
import { defaultTicketController } from "../controllers/ticketController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /api/tickets/purchase:
 *   post:
 *     summary: Realiza a compra atômica de um ingresso
 *     description: Decrementa o estoque do evento e gera o ingresso dentro de uma transação ACID no MongoDB
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: 6a91d64e6720f8a6d671b71f
 *     responses:
 *       201:
 *         description: Ingresso comprado com sucesso
 *       400:
 *         description: Requisição inválida ou ingressos esgotados
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Evento não encontrado
 */
router.post("/api/tickets/purchase", authMiddleware, defaultTicketController.purchase);

/**
 * @openapi
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Consulta os ingressos do usuário autenticado
 *     description: Retorna a lista de todos os ingressos comprados pelo usuário autenticado
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ingressos retornada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get("/api/tickets/my-tickets", authMiddleware, defaultTicketController.myTickets);

export default router;
