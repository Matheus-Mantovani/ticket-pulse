import { Router } from "express";
import { defaultAuthController } from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Rotas públicas
router.post("/register", defaultAuthController.register);
router.post("/login", defaultAuthController.login);
router.post("/refresh", defaultAuthController.refreshToken);

// Rota protegida por autenticação JWT Bearer
router.get("/me", authMiddleware, defaultAuthController.me);

export default router;
