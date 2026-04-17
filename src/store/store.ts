import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rssApi } from "../services/rssApi";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import { rtkQueryLogger } from "./logger";

export const store = configureStore({
  reducer: {
    [rssApi.reducerPath]: rssApi.reducer,
    ui: uiReducer,
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rssApi.middleware).concat(rtkQueryLogger),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
