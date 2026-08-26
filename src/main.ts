import "npm:dotenv/config";
import app from "./app.ts";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 [TicketPulse] Server running on http://localhost:${PORT}`);
  console.log(`📊 [Environment] PORT=${PORT}`);
});
