import express, { Express, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import responserPkg from "responser";
import throwlhosPkg from "throwlhos";
import { errorHandler } from "./middlewares/errorHandler.ts";
import authRoutes from "./routes/authRoutes.ts";

const responser = responserPkg.default || responserPkg;
const throwlhos = throwlhosPkg.default || throwlhosPkg;

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(responser);
app.use(throwlhos.middleware);

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "TicketPulse API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
