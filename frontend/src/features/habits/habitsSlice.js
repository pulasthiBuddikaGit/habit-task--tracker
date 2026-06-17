import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  habits: [],
  loading: false,
  error: null,
};

export const fetchHabits = createAsyncThunk(
  "habits/fetchHabits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/habits/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to fetch habits" }
      );
    }
  }
);

export const createHabit = createAsyncThunk(
  "habits/createHabit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/habits/", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to create habit" }
      );
    }
  }
);

export const updateHabit = createAsyncThunk(
  "habits/updateHabit",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/habits/${id}/`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to update habit" }
      );
    }
  }
);

export const deleteHabit = createAsyncThunk(
  "habits/deleteHabit",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/habits/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to delete habit" }
      );
    }
  }
);

export const completeHabit = createAsyncThunk(
  "habits/completeHabit",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/habits/${id}/complete/`);
      return response.data.habit;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to complete habit" }
      );
    }
  }
);

const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    clearHabitError: (state) => {
      state.error = null;
    },
    clearHabits: (state) => {
      state.habits = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.unshift(action.payload);
      })

      // Update
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(
          (habit) => habit.id === action.payload.id
        );

        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(
          (habit) => habit.id !== action.payload
        );
      })

      // Complete
      .addCase(completeHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(
          (habit) => habit.id === action.payload.id
        );

        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      });
  },
});

export const { clearHabitError, clearHabits } = habitsSlice.actions;
export default habitsSlice.reducer;