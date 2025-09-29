import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem("ptb_token") || null;
const initialUser = safeParse("ptb_user_cache") || null;

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("ptb_token");
    if (!token) return { user: null };

    try {
      const me = await api.get("/auth/me");
      return { user: me };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch current user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    token: initialToken,
    status: initialToken ? "bootstrapping" : "unauthenticated",
    error: null,
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
        const myId = user._id || user.id;
        if (myId) localStorage.setItem("ptb_user_id", String(myId));

        // cache a tiny snapshot for faster boot
        try {
          localStorage.setItem(
            "ptb_user_cache",
            JSON.stringify({
              _id: user._id || user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
            })
          );
        } catch {}
      }

      // If we have either user or token, treat as authenticated
      state.status =
        state.user && state.token ? "authenticated" : "unauthenticated";
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
      state.error = null;

      localStorage.removeItem("ptb_token");
      localStorage.removeItem("ptb_user_id");
      localStorage.removeItem("ptb_user_cache");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = "bootstrapping";
        state.error = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        const user = action.payload?.user || null;
        state.user = user;

        state.status =
          user && state.token ? "authenticated" : "unauthenticated";
        state.error = null;

        // refresh the snapshot cache if user present
        if (user) {
          try {
            localStorage.setItem(
              "ptb_user_cache",
              JSON.stringify({
                _id: user._id || user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
              })
            );
          } catch {}
        } else {
          // no user returned -> clear stale cache
          localStorage.removeItem("ptb_user_cache");
          localStorage.removeItem("ptb_user_id");
        }
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.status = "unauthenticated";
        state.error = action.payload || "Auth bootstrap failed";

        localStorage.removeItem("ptb_token");
        localStorage.removeItem("ptb_user_id");
        localStorage.removeItem("ptb_user_cache");
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectIsAdmin = (s) => s.auth.user?.role === "admin";
