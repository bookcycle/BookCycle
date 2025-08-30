import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
    status: 'idle',
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // pretend login(replace with real API later)
        setCredentials: (state, action) => {
            const {user, token } = action.payload
            state.user = user
            state.token = token ?? null
            state.error = null
        },
        logout:(state) => {
            state.user = null
            state.token = null
        },
    },
})

export const {setCredentials, logout} = authSlice.actions
export default authSlice.reducer