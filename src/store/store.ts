import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rssApi } from '../services/rssApi';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
// import authReducer from './slices/authSlice'; // Uncomment if you have auth
import { rtkQueryLogger } from './logger'; // <-- Import the logger

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [rssApi.reducerPath]: rssApi.reducer,
    ui: uiReducer,
    auth: authReducer
  },
  // Adding the api middleware enabling caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(rssApi.middleware)
      .concat(rtkQueryLogger), // <-- Add Logger Here
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;