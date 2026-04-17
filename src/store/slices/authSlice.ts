import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../../types";

const getSafeStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};
const isLoginPage =
  typeof window !== "undefined" && window.location.pathname === "/login";

const initialState: AuthState = {
  accessToken: isLoginPage ? null : getSafeStorage("accessToken"),
  type: isLoginPage ? null : getSafeStorage("userType"),
  isAuthenticated: isLoginPage ? false : !!getSafeStorage("accessToken"),
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; type: string }>,
    ) => {
      const { accessToken, type } = action.payload;
      state.accessToken = accessToken;
      state.type = type;
      state.isAuthenticated = Boolean(accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userType", type);

      console.log(accessToken);
    },

    logout: (state) => {
      state.accessToken = null;
      state.type = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userType");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
