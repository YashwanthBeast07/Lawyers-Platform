// ── Enums (mirrors backend) ───────────────────────────────────────────────────

export type CaseStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED";
export type CaseType = "CIVIL" | "CRIMINAL" | "CORPORATE" | "FAMILY" | "PROPERTY" | "CYBER" | "OTHER";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type AppointmentMode = "ONLINE" | "IN_PERSON";
export type PaymentStatus = "INITIATED" | "CREATED" | "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
export type PaymentMethod = "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET";
export type NotificationType = "BOOKING" | "PAYMENT" | "CASE_UPDATE" | "SYSTEM" | "REVIEW";
export type UserRole = "CLIENT" | "LAWYER" | "ADMIN";

// ── Shared Wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  last: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfileResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  barNumber?: string;
  specialization?: string;
}

// ── User / Profile ─────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profilePictureUrl?: string;
  isActive: boolean;
  specialization?: string;
  barNumber?: string;
  isVerified?: boolean;
  averageRating?: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  specialization?: string;
}

// ── Lawyer ────────────────────────────────────────────────────────────────────

export interface LawyerProfileResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  barNumber?: string;
  specialization?: string;
  experienceYears?: number;
  hourlyRate?: number;
  isVerified: boolean;
  averageRating?: number;
  totalReviews?: number;
  bio?: string;
  createdAt?: string;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export interface SessionResponse {
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export interface CaseResponse {
  id: number;
  title: string;
  description: string;
  caseType: CaseType;
  status: CaseStatus;
  quotedAmount?: number;
  orderCopyPath?: string;
  clientId: number;
  clientName: string;
  lawyerId?: number;
  lawyerName?: string;
  taggedLaws?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseRequestDto {
  title: string;
  description: string;
  caseType: CaseType;
  lawyerId?: number;
  lawIds?: number[];
}

export interface AssignLawyerRequest {
  lawyerId: number;
}

export interface UpdateStatusRequest {
  status: CaseStatus;
}

export interface CaseMessageResponse {
  id: number;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

// ── Appointments ───────────────────────────────────────────────────────────────

export interface AppointmentResponse {
  id: number;
  caseRequestId: number;
  caseTitle: string;
  clientId: number;
  clientName: string;
  lawyerId: number;
  lawyerName: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: AppointmentMode;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface AppointmentRequest {
  caseRequestId: number;
  scheduledAt: string; // ISO datetime
  durationMinutes?: number;
  mode?: AppointmentMode;
  notes?: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ReviewResponse {
  id: number;
  lawyerId: number;
  lawyerName: string;
  clientId: number;
  clientName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface ReviewRequest {
  lawyerId: number;
  caseRequestId: number;
  rating: number;
  comment: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface PaymentResponse {
  id: number;
  userId: number;
  caseRequestId: number;
  appointmentId?: number;
  transactionRef?: string;
  amount: number;
  currency: string;
  refundedAmount?: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayRefundId?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  paymentId: number;
  caseRequestId: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receipt: string;
  isRetry: boolean;
  retryCount: number;
}

export interface CreateOrderRequest {
  caseRequestId: number;
  amount: number;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
