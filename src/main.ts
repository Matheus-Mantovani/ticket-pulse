import "dotenv/config";
import app from "./app.ts";
import { connectDatabase, disconnectDatabase } from "./config/database.ts";

const PORT = Number(Deno.env.get("PORT")) || 3000;

async function bootstrap() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDatabase();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 [TicketPulse] Server running on http://localhost:${PORT}`);
      console.log(`📊 [Environment] PORT=${PORT}`);
    });

    // Graceful Shutdown handlers
    const shutdown = (signal: string) => {
      console.log(`\n🛑 [Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log("👋 [Server] Graceful shutdown complete. Exiting.");
        Deno.exit(0);
      });
    };

    Deno.addSignalListener("SIGINT", () => shutdown("SIGINT"));

    if (Deno.build.os !== "windows") {
      Deno.addSignalListener("SIGTERM", () => shutdown("SIGTERM"));
    }
  } catch (error) {
    console.error("💥 [Fatal Error] Server bootstrapping failed:", error);
    Deno.exit(1);
  }
}

bootstrap();
