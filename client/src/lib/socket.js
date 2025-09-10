import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (socket) return socket;
  const token = localStorage.getItem("ptb_token");
  const apiBase = import.meta.env.VITE_API_BASE_URL; // e.g., http://localhost:5000/api
  const serverOrigin = apiBase.replace(/\/api\/?$/, "");

  socket = io(serverOrigin, {
    //transports: ["websocket"],
    withCredentials: true,
    auth: { token },
  });
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}
