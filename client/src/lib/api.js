import axios from "axios";

//all api call will be start from this base url
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function api(path, { method = "GET", body, token } = {}) {
  try {
    const res = await axios({
      url: `${API_BASE}${path}`,
      method,
      data: body, //JSON format by default
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true, // cookie 
    });

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Request failed");
  }
}
