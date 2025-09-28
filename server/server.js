import "dotenv/config";
import http from "http";

import app from "./app.js";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/env.js";
import { setupSocket } from "./src/realtime/socket.js";

const server = http.createServer(app);
setupSocket(server);

await connectDB();

const PORT = config.port || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
