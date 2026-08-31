import { Router } from "express";
import { defaultEventController } from "../controllers/eventController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { requireRole } from "../middlewares/roleMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Lista eventos públicos
 *     description: Retorna a lista paginada de eventos públicos disponíveis com suporte a filtro por título
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca por título do evento
 *     responses:
 *       200:
 *         description: Lista de eventos retornada com sucesso
 */
router.get("/api/events", defaultEventController.list);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Detalhes de um evento por ID
 *     description: Retorna as informações completas de um evento específico pelo seu ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento no MongoDB
 *     responses:
 *       200:
 *         description: Detalhes do evento retornados com sucesso
 *       404:
 *         description: Evento não encontrado
 */
router.get("/api/events/:id", defaultEventController.getById);

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Cria um novo evento (ADMIN)
 *     description: Endpoint restrito a administradores para cadastrar novos eventos no sistema
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - location
 *               - price
 *               - totalTickets
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: Conferência anual sobre tecnologia e Deno
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-01T20:00:00.000Z
 *               location:
 *                 type: string
 *                 example: Centro de Convenções SP
 *               price:
 *                 type: number
 *                 example: 150
 *               totalTickets:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (exige perfil ADMIN)
 */
router.post("/api/events", authMiddleware, requireRole("ADMIN"), defaultEventController.create);

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: Atualiza um evento existente (ADMIN)
 *     description: Endpoint restrito a administradores para atualizar dados de um evento por ID
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento no MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               totalTickets:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (exige perfil ADMIN)
 *       404:
 *         description: Evento não encontrado
 */
router.put("/api/events/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.update);

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: Remove um evento (ADMIN)
 *     description: Endpoint restrito a administradores para deletar um evento pelo ID
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do evento no MongoDB
 *     responses:
 *       200:
 *         description: Evento excluído com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (exige perfil ADMIN)
 *       404:
 *         description: Evento não encontrado
 */
router.delete("/api/events/:id", authMiddleware, requireRole("ADMIN"), defaultEventController.delete);

export default router;
