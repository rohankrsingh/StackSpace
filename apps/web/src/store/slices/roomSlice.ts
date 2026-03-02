import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Room {
  roomId: string;
  status: "running" | "stopped";
  ideUrl: string;
  containerName?: string;
  language?: string;
}

interface RoomState {
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoom: null,
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
      state.error = null;
    },
    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRoomError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateRoomStatus: (
      state,
      action: PayloadAction<{ status: "running" | "stopped" }>
    ) => {
      if (state.currentRoom) {
        state.currentRoom.status = action.payload.status;
      }
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
  },
});

export const {
  setCurrentRoom,
  setRoomLoading,
  setRoomError,
  updateRoomStatus,
  clearCurrentRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
