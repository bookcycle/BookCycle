import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  //Reducer is the rules for updating State
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user; //  user's data will be placed in Redux state
      state.token = token ?? null; // JWT will be placed in Redux state
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
