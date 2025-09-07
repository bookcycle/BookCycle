import axios from "axios";

export async function callGemini(history, message) {
  const { data } = await axios.post("http://localhost:5000/api/ai/chat", {
    history,
    message,
  });
  return data.text;
}
