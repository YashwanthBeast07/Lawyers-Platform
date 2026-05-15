import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

// ── Instance ──────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  withCredentials: true, // Send the HttpOnly refresh_token cookie automatically
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Token Store (in-memory — never localStorage for access tokens) ────────────

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// ── Request Interceptor — attach Bearer token ──────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor — silent token refresh on 401 ────────────────────────

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // The refresh_token HttpOnly cookie is sent automatically via withCredentials
      const { data } = await api.post<{
        data: { accessToken: string };
      }>("/auth/refresh");

      const newToken = data.data.accessToken;
      setAccessToken(newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear token and let the caller decide how to handle it.
      // Do NOT call window.location.href here: that races against React Router and
      // prevents fetchProfileThunk from ever resolving, leaving loading = true forever.
      setAccessToken(null);
      processQueue(refreshError as AxiosError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
