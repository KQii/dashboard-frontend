import { createSlice } from "@reduxjs/toolkit";
import { AuthUser } from "../types/auth.types";
import Cookies from "js-cookie";

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
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });
      return initialState;
    },
  },
});

export const { setUser, setLogged, signOut } = authSlice.actions;
export default authSlice.reducer;
