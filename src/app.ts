import express, { Express, Request, Response } from "npm:express";
import cors from "npm:cors";
import morgan from "npm:morgan";

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
