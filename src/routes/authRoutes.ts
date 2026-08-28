import { Router } from "express";
import { defaultAuthController } from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Rotas públicas com caminhos absolutos completos
router.post("/api/auth/register", defaultAuthController.register);
router.post("/api/auth/login", defaultAuthController.login);
router.post("/api/auth/refresh", defaultAuthController.refreshToken);

// Rota protegida por autenticação JWT Bearer com caminho absoluto completo
router.get("/api/auth/me", authMiddleware, defaultAuthController.me);

export default router;
