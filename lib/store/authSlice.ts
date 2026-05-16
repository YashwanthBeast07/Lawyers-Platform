import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, userService } from "@/lib/services";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SessionResponse,
  UserProfileResponse,
} from "@/lib/types";

// ── State ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: UserProfileResponse | null;
  accessToken: string | null;
  sessions: SessionResponse[];
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  sessions: [],
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload);
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Login failed. Please check your credentials.";
    return rejectWithValue(message);
  }
});

export const registerThunk = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Registration failed. Please try again.";
    return rejectWithValue(message);
  }
});

export const fetchProfileThunk = createAsyncThunk<
  UserProfileResponse,
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    return await userService.getProfile();
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Failed to load profile.";
    return rejectWithValue(message);
  }
});

export const fetchSessionsThunk = createAsyncThunk<
  SessionResponse[],
  void,
  { rejectValue: string }
>("auth/fetchSessions", async (_, { rejectWithValue }) => {
  try {
    return await authService.getSessions();
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Failed to load sessions.";
    return rejectWithValue(message);
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const logoutAllThunk = createAsyncThunk("auth/logoutAll", async () => {
  await authService.logoutAll();
});

export const revokeSessionThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("auth/revokeSession", async (sessionId, { rejectWithValue }) => {
  try {
    await authService.revokeSession(sessionId);
    return sessionId;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Failed to revoke session.";
    return rejectWithValue(message);
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Used after silent token refresh to keep Redux in sync
    setToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    resetAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.sessions = [];
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });

    // ── Register ──
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });

    // ── Fetch Profile ──
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? "Unknown error";
      });

    // ── Sessions ──
    builder
      .addCase(fetchSessionsThunk.fulfilled, (state, action) => {
        state.sessions = action.payload;
      });

    // ── Logout ──
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        Object.assign(state, initialState);
      });

    // ── Logout All ──
    builder
      .addCase(logoutAllThunk.fulfilled, (state) => {
        Object.assign(state, initialState);
      });

    // ── Revoke Session ──
    builder.addCase(revokeSessionThunk.fulfilled, (state, action) => {
      state.sessions = state.sessions.filter(
        (s) => s.sessionId !== action.payload
      );
    });
  },
});

export const { clearError, setToken, resetAuth } = authSlice.actions;
export default authSlice.reducer;
