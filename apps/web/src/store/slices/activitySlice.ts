import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Activity {
  id: string;
  type: string;
  path?: string;
  user: { id: string; name: string };
  ts: string;
}

interface ActivityState {
  activities: Activity[];
}

const initialState: ActivityState = {
  activities: [],
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.push(action.payload);
      // Keep only last 50 activities
      if (state.activities.length > 50) {
        state.activities = state.activities.slice(-50);
      }
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
});

export const { addActivity, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
