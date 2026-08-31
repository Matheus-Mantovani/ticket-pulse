import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import responserPkg from "responser";
import throwlhosPkg from "throwlhos";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { errorHandler } from "./middlewares/errorHandler.ts";
import healthRoutes from "./routes/healthRoutes.ts";
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
    tags: [
      {
        name: "Health",
        description: "Verificação de integridade da API",
      },
      {
        name: "Auth",
        description: "Autenticação e gerenciamento de sessões JWT",
      },
      {
        name: "Events",
        description: "Gerenciamento e consulta de eventos",
      },
      {
        name: "Tickets",
        description: "Compra atômica e consulta de ingressos",
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

// Opções de personalização da interface do Swagger UI
const swaggerUiOptions = {
  swaggerOptions: {
    displayRequestDuration: true,
    defaultModelsExpandDepth: -1, // Oculta a seção de schemas genéricos no rodapé
  },
};

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(responser);
app.use(throwlhos.middleware);

// Swagger UI Documentation Route (dinâmico via swagger-jsdoc)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

// API Routes registrando routers diretamente com caminhos absolutos completos
app.use(healthRoutes);
app.use(authRoutes);
app.use(eventRoutes);
app.use(ticketRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
