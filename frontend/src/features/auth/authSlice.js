import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register/", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Registration failed" }
      );
    }
  }
);

//these are not reducer functions, they are async thunks that handle asynchronous logic (like API calls) and dispatch actions based on the result of those operations.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login/", formData);

      const user = {
        username: formData.username,
      };

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
        user,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Login failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //reducer is a pure JavaScript function that determines how the application's state changes in response to an action. 
    // It takes the current state and an action as arguments and returns a new state. In this case, 
    // the logout reducer is responsible for clearing the user's authentication data from both the Redux state and localStorage when the user logs out.
    // This reducer is responsible for logging out the user. It clears the user information and tokens from the state and also removes them from localStorage.
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;