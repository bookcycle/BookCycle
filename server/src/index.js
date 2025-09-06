import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const app = express();

//middleware setup
app.use(helmet());
app.use(express.json());

// CORS
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,  //allow cookie/authorization
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.get("/", (req, res) => res.send("API is working"));

app.use("/api/auth", authRoutes);

//error middleware
app.use(notFound);
app.use(errorHandler);

await connectDB();

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
