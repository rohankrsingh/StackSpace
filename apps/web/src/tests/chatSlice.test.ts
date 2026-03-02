import chatReducer, { addMessage, clearMessages } from "../store/slices/chatSlice";
import { describe, it, expect } from "vitest";

describe("chatSlice", () => {
    const initialState = { messages: [] };

    it("should handle initial state", () => {
        expect(chatReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle addMessage", () => {
        const message = {
            id: "1",
            user: { id: "u1", name: "User 1" },
            message: "Hello",
            ts: "2024-01-01T00:00:00Z",
        };
        const actual = chatReducer(initialState, addMessage(message));
        expect(actual.messages).toEqual([message]);
    });

    it("should handle clearMessages", () => {
        const state = {
            messages: [
                {
                    id: "1",
                    user: { id: "u1", name: "User 1" },
                    message: "Hello",
                    ts: "2024-01-01T00:00:00Z",
                },
            ],
        };
        const actual = chatReducer(state, clearMessages());
        expect(actual.messages).toEqual([]);
    });
});
