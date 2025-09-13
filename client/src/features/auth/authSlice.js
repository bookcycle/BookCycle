// client/src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialToken = localStorage.getItem("ptb_token") || null;
// optional: restore a minimal user object if you cached it (not required)
const initialUser =
  (() => {
    try {
      const raw = localStorage.getItem("ptb_user_cache");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,    // may be null until /auth/me returns
    token: initialToken,  // "ptb_token"
  },
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload || {};
      if (token) {
        state.token = token;
        localStorage.setItem("ptb_token", token);
      }
      if (user) {
        state.user = user;
        // 🔐 this is the critical line for chat:
        // save your Mongo _id so UI can exclude you from participants
        const myId = user._id || user.id;
        if (myId) localStorage.setItem("ptb_user_id", String(myId));

        // (optional) cache a tiny user snapshot for faster boot
        try {
          localStorage.setItem(
            "ptb_user_cache",
            JSON.stringify({
              _id: user._id || user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            })
          );
        } catch {}
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("ptb_token");
      localStorage.removeItem("ptb_user_id");
      localStorage.removeItem("ptb_user_cache");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
