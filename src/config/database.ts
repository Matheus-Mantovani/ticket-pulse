import mongoose, { ClientSession } from "npm:mongoose";

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("❌ [Database Error] MONGO_URI is not defined in environment variables");
  }

  mongoose.connection.on("connected", () => {
    console.log("🍃 [Database] Connected successfully to MongoDB Atlas Cluster");
  });

  mongoose.connection.on("error", (err) => {
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
