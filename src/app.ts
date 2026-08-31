import express, { Express, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import responserPkg from "responser";
import throwlhosPkg from "throwlhos";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { errorHandler } from "./middlewares/errorHandler.ts";
import authRoutes from "./routes/authRoutes.ts";
import eventRoutes from "./routes/eventRoutes.ts";
import ticketRoutes from "./routes/ticketRoutes.ts";

const responser = responserPkg.default || responserPkg;
const throwlhos = throwlhosPkg.default || throwlhosPkg;

const app: Express = express();

// Configuração do Swagger JSDoc lendo as anotações @openapi dos Routers
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TicketPulse API",
      version: "1.0.0",
      description: "API RESTful para gerenciamento de eventos e venda de ingressos (AGX Corporate Architecture)",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor Local de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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

// Swagger UI Documentation Route (dinâmico via swagger-jsdoc)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes registrando routers diretamente com caminhos absolutos completos
app.use(authRoutes);
app.use(eventRoutes);
app.use(ticketRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
