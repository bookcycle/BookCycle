import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
}
