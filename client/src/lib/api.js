import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // allow cookies if needed
  timeout: 15000, // 15s timeout
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ptb_token");
  
  //add bearer
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function request(method, url, { data, params, headers } = {}) {
  try {
    const res = await http.request({ method, url, data, params, headers });
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Request failed";
    if (import.meta.env.DEV) {
      console.error(`[API ${method}] ${url}:`, err?.response || err);
    }
    throw new Error(message);
  }
}


//we pass headers through config; if not passed, it'll be undefined
export const api = {
  get: (url, config) => request("GET", url, config),
  post: (url, data, config) => request("POST", url, { ...config, data }),
  put: (url, data, config) => request("PUT", url, { ...config, data }),
  patch: (url, data, config) => request("PATCH", url, { ...config, data }),
  delete: (url, config) => request("DELETE", url, config),
  _http: http,
};
export default api;
