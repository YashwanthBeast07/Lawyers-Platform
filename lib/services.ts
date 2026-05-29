import api, { setAccessToken } from "@/lib/axios";
import type {
  ApiResponse,
  AppointmentRequest,
  AppointmentResponse,
  AppointmentStatus,
  AssignLawyerRequest,
  AuthResponse,
  CaseRequestDto,
  CaseResponse,
  CaseStatus,
  CreateOrderRequest,
  LawyerProfileResponse,
  LoginRequest,
  NotificationDto,
  OrderResponse,
  PagedResponse,
  PaymentResponse,
  PaymentVerificationRequest,
  RegisterRequest,
  ReviewRequest,
  ReviewResponse,
  SessionResponse,
  UpdateStatusRequest,
  UserProfileResponse,
  UpdateProfileRequest,
  CaseMessageResponse,
} from "@/lib/types";

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    if (data.data.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  async register(payload: RegisterRequest): Promise<UserProfileResponse> {
    const { data } = await api.post<ApiResponse<UserProfileResponse>>("/auth/register", payload);
    return data.data;
  },

  async getMe(): Promise<UserProfileResponse> {
    const { data } = await api.get<ApiResponse<UserProfileResponse>>("/users/me");
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    setAccessToken(null);
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/refresh");
    return data.data;
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
    setAccessToken(null);
  },

  async getSessions(): Promise<SessionResponse[]> {
    const { data } = await api.get<ApiResponse<SessionResponse[]>>("/auth/sessions");
    return data.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },
};

// ── User Service ──────────────────────────────────────────────────────────────

export const userService = {
  async getProfile(): Promise<UserProfileResponse> {
    const { data } = await api.get<ApiResponse<UserProfileResponse>>("/users/me");
    return data.data;
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
    const { data } = await api.patch<ApiResponse<UserProfileResponse>>("/users/me", payload);
    return data.data;
  },

  async getPendingVerifications(page = 0, size = 20): Promise<PagedResponse<LawyerProfileResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<LawyerProfileResponse>>>("/admin/lawyers/pending", {
      params: { page, size },
    });
    return data.data;
  },

  async verifyLawyer(id: number): Promise<void> {
    await api.patch(`/admin/lawyers/${id}/verify`);
  },
};

// ── Lawyer Service ────────────────────────────────────────────────────────────

export const lawyerService = {
  async getVerifiedLawyers(
    specialization?: string,
    page = 0,
    size = 10
  ): Promise<PagedResponse<LawyerProfileResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<LawyerProfileResponse>>>(
      "/users/lawyers",
      {
        params: { specialization, page, size },
      }
    );
    return data.data;
  },

  async search(params: {
    specialization?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<LawyerProfileResponse>> {
    return this.getVerifiedLawyers(params.specialization, params.page, params.size);
  },

  async getById(id: number): Promise<LawyerProfileResponse> {
    const { data } = await api.get<ApiResponse<LawyerProfileResponse>>(`/lawyers/${id}`);
    return data.data;
  },
};

// ── Case Service ──────────────────────────────────────────────────────────────

export const caseService = {
  async create(payload: CaseRequestDto): Promise<CaseResponse> {
    const { data } = await api.post<ApiResponse<CaseResponse>>("/cases", payload);
    return data.data;
  },

  async getById(id: number): Promise<CaseResponse> {
    const { data } = await api.get<ApiResponse<CaseResponse>>(`/cases/${id}`);
    return data.data;
  },

  async getMyCases(page = 0, size = 10): Promise<PagedResponse<CaseResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<CaseResponse>>>("/cases/my", {
      params: { page, size },
    });
    return data.data;
  },

  async getMatchedCases(page = 0, size = 10): Promise<PagedResponse<CaseResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<CaseResponse>>>("/cases/matched", {
      params: { page, size },
    });
    return data.data;
  },

  async assignLawyer(id: number, payload: AssignLawyerRequest): Promise<CaseResponse> {
    const { data } = await api.patch<ApiResponse<CaseResponse>>(`/cases/${id}/assign`, payload);
    return data.data;
  },

  async updateStatus(id: number, payload: UpdateStatusRequest): Promise<CaseResponse> {
    const { data } = await api.patch<ApiResponse<CaseResponse>>(`/cases/${id}/status`, payload);
    return data.data;
  },

  async uploadOrderCopy(id: number, file: File): Promise<CaseResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiResponse<CaseResponse>>(`/cases/${id}/order-copy`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async downloadOrderCopy(id: number): Promise<Blob> {
    const { data } = await api.get(`/cases/${id}/download-order-copy`, {
      responseType: "blob",
    });
    return data;
  },

  async getMessages(id: number): Promise<CaseMessageResponse[]> {
    const { data } = await api.get<ApiResponse<CaseMessageResponse[]>>(`/cases/${id}/messages`);
    return data.data;
  },

  async sendMessage(id: number, message: string): Promise<CaseMessageResponse> {
    const { data } = await api.post<ApiResponse<CaseMessageResponse>>(`/cases/${id}/messages`, { message });
    return data.data;
  },

  async claimCase(id: number): Promise<CaseResponse> {
    const { data } = await api.post<ApiResponse<CaseResponse>>(`/cases/${id}/claim`);
    return data.data;
  },

  async updateFee(id: number, quotedAmount: number): Promise<CaseResponse> {
    const { data } = await api.patch<ApiResponse<CaseResponse>>(`/cases/${id}/fee`, { quotedAmount });
    return data.data;
  },

  async getAllCases(params: {
    status?: CaseStatus;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<CaseResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<CaseResponse>>>("/cases/admin/all", { params });
    return data.data;
  },
};

// ── Appointment Service ───────────────────────────────────────────────────────

export const appointmentService = {
  async book(payload: AppointmentRequest): Promise<AppointmentResponse> {
    const { data } = await api.post<ApiResponse<AppointmentResponse>>("/appointments", payload);
    return data.data;
  },

  async getMyAppointments(page = 0, size = 10): Promise<PagedResponse<AppointmentResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<AppointmentResponse>>>("/appointments/my", {
      params: { page, size },
    });
    return data.data;
  },

  async updateStatus(id: number, status: AppointmentStatus): Promise<AppointmentResponse> {
    const { data } = await api.patch<ApiResponse<AppointmentResponse>>(
      `/appointments/${id}/status`,
      null,
      { params: { status } }
    );
    return data.data;
  },
};

// ── Notification Service ──────────────────────────────────────────────────────

export const notificationService = {
  async getMyNotifications(page = 0, size = 20): Promise<PagedResponse<NotificationDto>> {
    const { data } = await api.get<ApiResponse<PagedResponse<NotificationDto>>>("/notifications", {
      params: { page, size },
    });
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<number>>("/notifications/unread-count");
    return data.data;
  },

  async markAllRead(): Promise<void> {
    await api.patch("/notifications/mark-all-read");
  },
};

// ── Review Service ────────────────────────────────────────────────────────────

export const reviewService = {
  async submit(payload: ReviewRequest): Promise<ReviewResponse> {
    const { data } = await api.post<ApiResponse<ReviewResponse>>("/reviews", payload);
    return data.data;
  },

  async getForLawyer(lawyerId: number, page = 0, size = 10): Promise<PagedResponse<ReviewResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<ReviewResponse>>>(
      `/reviews/lawyers/${lawyerId}`,
      { params: { page, size } }
    );
    return data.data;
  },
};

// ── Payment Service ───────────────────────────────────────────────────────────

export const paymentService = {
  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const { data } = await api.post<ApiResponse<OrderResponse>>("/payments/orders", payload);
    return data.data;
  },

  async verifyPayment(payload: PaymentVerificationRequest): Promise<PaymentResponse> {
    const { data } = await api.post<ApiResponse<PaymentResponse>>("/payments/verify", payload);
    return data.data;
  },

  async getByCase(caseId: number): Promise<PaymentResponse> {
    const { data } = await api.get<ApiResponse<PaymentResponse>>(`/payments/cases/${caseId}`);
    return data.data;
  },

  async getMyPayments(page = 0, size = 10): Promise<PagedResponse<PaymentResponse>> {
    const { data } = await api.get<ApiResponse<PagedResponse<PaymentResponse>>>("/payments/my", {
      params: { page, size },
    });
    return data.data;
  },

  async retryPayment(id: number): Promise<OrderResponse> {
    const { data } = await api.post<ApiResponse<OrderResponse>>(`/payments/${id}/retry`);
    return data.data;
  },
};
