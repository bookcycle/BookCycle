import express from "express";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";

const app = express();

connectDB();

app.get("/", (req, res)=>res.send("API is working"));

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
