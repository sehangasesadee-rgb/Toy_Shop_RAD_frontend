import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async () => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("Please login first");

    const response = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load profile");
    }

    return result.data as UserProfile;
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: { fullName: string; phone: string }) => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("Please login first");

    const response = await fetch("http://localhost:5000/api/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Profile update failed");
    }

    return result.data as UserProfile;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load profile";
      })
      .addCase(updateProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Profile update failed";
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;