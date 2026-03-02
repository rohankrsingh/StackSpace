import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./slices/roomSlice";
import chatReducer from "./slices/chatSlice";
import activityReducer from "./slices/activitySlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    room: roomReducer,
    chat: chatReducer,
    activity: activityReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
