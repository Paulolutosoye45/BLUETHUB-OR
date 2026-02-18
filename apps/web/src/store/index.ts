import { configureStore } from "@reduxjs/toolkit";
import ClassActionSlice from "./class-action-slice";

export const store = configureStore({
  reducer: {
    action: ClassActionSlice,
  },
  // Optional: Add middleware, devtools config, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
