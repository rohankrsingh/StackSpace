import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  id: string;
  user: { id: string; name: string };
  message: string;
  ts: string;
  fileId?: string;
  fileType?: string;
  fileName?: string;
}

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    ...initialState,
    unreadCount: 0,
  } as ChatState & { unreadCount: number },
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      // Prevent duplicate messages by checking if a message with the same ID already exists
      const exists = state.messages.some((msg) => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { addMessage, clearMessages, incrementUnread, resetUnread } = chatSlice.actions;
export default chatSlice.reducer;
