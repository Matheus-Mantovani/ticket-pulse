import { Router, Request, Response } from "express";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retorna o status de saúde da aplicação
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API operando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: TicketPulse API
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-31T14:00:00.000Z"
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "TicketPulse API",
    timestamp: new Date().toISOString(),
  });
});

export default router;
