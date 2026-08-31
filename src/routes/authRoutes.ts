import { Router } from "express";
import { defaultAuthController } from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria um novo usuário no sistema (role USER ou ADMIN)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados de requisição inválidos ou e-mail em uso
 */
router.post("/api/auth/register", defaultAuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     description: Autentica o usuário e gera um par de tokens (Access Token + Refresh Token)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/api/auth/login", defaultAuthController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Renova o Access Token
 *     description: Emite um novo Access Token JWT a partir de um Refresh Token válido
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1Ni...
 *     responses:
 *       200:
 *         description: Access Token renovado com sucesso
 *       401:
 *         description: Refresh Token inválido ou expirado
 */
router.post("/api/auth/refresh", defaultAuthController.refreshToken);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Consulta dados do perfil autenticado
 *     description: Retorna as informações do usuário associado ao Access Token informado no header Authorization
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário retornado com sucesso
 *       401:
 *         description: Token ausente, inválido ou expirado
 */
router.get("/api/auth/me", authMiddleware, defaultAuthController.me);

export default router;
