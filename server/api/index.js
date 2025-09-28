import app from "../app.js";
import { connectDB } from "../src/config/db.js";

// Ensure DB is connected once per lambda instance
await connectDB();

export default app;
