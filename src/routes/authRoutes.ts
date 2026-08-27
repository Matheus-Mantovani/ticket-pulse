import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  meController,
} from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = Router();

// Rotas públicas
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshTokenController);

// Rota protegida por autenticação JWT Bearer
router.get("/me", authMiddleware, meController);

export default router;
