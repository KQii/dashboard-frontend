import { createSlice } from "@reduxjs/toolkit";
import { AuthUser } from "../types/auth.types";

export interface AuthState {
  isLogged: boolean;
  user: AuthUser | null;
}

const initialState: Partial<AuthState> = {
  isLogged: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }: { payload: AuthUser }) => {
      state.user = payload;
      console.log(state.user);
    },
    setLogged: (state, { payload }: { payload: boolean }) => {
      state.isLogged = payload;
      console.log(state.isLogged);
    },
    signOut: () => {
      window.location.href = "/logout";
      return initialState;
    },
  },
});

export const { setUser, setLogged, signOut } = authSlice.actions;
export default authSlice.reducer;
