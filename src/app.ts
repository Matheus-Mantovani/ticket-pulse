import express, { Express, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "TicketPulse API",
    timestamp: new Date().toISOString(),
  });
});

export default app;
