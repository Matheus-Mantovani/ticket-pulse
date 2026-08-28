import mongoose, { ClientSession } from "mongoose";

export async function connectDatabase(): Promise<void> {
  const useTestDb = Deno.env.get("USE_TEST_DB") === "true" || Deno.args.includes("--test-db");
  const mongoUri = useTestDb
    ? (Deno.env.get("MONGO_URI_TEST") || Deno.env.get("MONGO_URI"))
    : Deno.env.get("MONGO_URI");

  if (!mongoUri) {
    throw new Error("❌ [Database Error] MONGO_URI is not defined in environment variables");
  }

  mongoose.connection.on("connected", () => {
    const dbName = mongoose.connection.name;
    console.log(`🍃 [Database] Connected successfully to MongoDB Atlas Cluster (${dbName})`);
  });

  mongoose.connection.on("error", (err: Error) => {
    console.error("❌ [Database Connection Error]:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ [Database] Connection to MongoDB disconnected");
  });

  await mongoose.connect(mongoUri);
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("🔌 [Database] Gracefully disconnected from MongoDB");
  }
}

export async function getMongooseSession(): Promise<ClientSession> {
  return await mongoose.startSession();
}
