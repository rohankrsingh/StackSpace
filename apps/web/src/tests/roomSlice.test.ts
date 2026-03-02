import roomReducer, { setCurrentRoom, clearCurrentRoom } from "../store/slices/roomSlice";
import { describe, it, expect } from "vitest";

describe("roomSlice", () => {
    const initialState = {
        currentRoom: null,
        loading: false,
        error: null,
    };

    it("should handle initial state", () => {
        expect(roomReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle setCurrentRoom", () => {
        const room = {
            roomId: "test-room",
            status: "running" as const,
            ideUrl: "http://localhost:8080",
        };
        const actual = roomReducer(initialState, setCurrentRoom(room));
        expect(actual.currentRoom).toEqual(room);
    });

    it("should handle clearCurrentRoom", () => {
        const state = {
            currentRoom: {
                roomId: "test-room",
                status: "running" as const,
                ideUrl: "http://localhost:8080",
            },
            loading: false,
            error: null,
        };
        const actual = roomReducer(state, clearCurrentRoom());
        expect(actual.currentRoom).toBeNull();
    });
});
