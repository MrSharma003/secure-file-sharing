import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk for user login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/users/login`,
        {
          email,
          password,
        }
      );
      console.log(response);
      return response.data; // Assumes the backend returns { user, token }
    } catch (error) {
      return rejectWithValue(error.response.data || "Failed to login");
    }
  }
);

// Thunk for user signup
export const signup = createAsyncThunk(
  "auth/signup",
  async ({ name, email, password, confirmPassword, isAuthor }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/users/register`,
        {
          name,
          email,
          password,
          re_password: confirmPassword,
          is_author: isAuthor
        }
      );
      return response.data; // Assumes the backend returns { user, token }
    } catch (error) {
      return rejectWithValue(error.response.data || "Failed to signup");
    }
  }
);

// Thunk for OTP verification
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      console.log("Inside otp method");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/users/api/verify_otp`,
        {
          email,
          otp,
        }
      );
      console.log(response);
      return response.data; // Assumes the backend returns a success message or token
    } catch (error) {
      return rejectWithValue(error.response.data || "Failed to verify OTP");
    }
  }
);

// Initial state for the auth slice
const initialState = {
  validCred: false,
  token: null,
  refresh_token: null,
  status: "idle", // Can be 'idle', 'loading', 'succeeded', or 'failed'
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refresh_token = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    // Login action handlers
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.validCred = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.validCred = false;
        state.error = action.payload || "Login failed";
      });

    // Signup action handlers
    builder
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Signup failed";
      });

    // OTP verification action handlers
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.refresh_token = action.payload.refresh;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "OTP verification failed";
      });
  },
});

// Export actions and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
