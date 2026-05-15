import type { CaseStatus, AppointmentStatus, PaymentStatus } from "@/lib/types";

// ── Case Status ───────────────────────────────────────────────────────────────

const CASE_STATUS_STYLES: Record<CaseStatus, string> = {
  OPEN:        "bg-blue-50 text-blue-700 border-blue-200",
  ASSIGNED:    "bg-purple-50 text-purple-700 border-purple-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED:    "bg-green-50 text-green-700 border-green-200",
  CLOSED:      "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED:   "bg-red-50 text-red-700 border-red-200",
};

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN:        "Open",
  ASSIGNED:    "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
  CANCELLED:   "Cancelled",
};

// ── Appointment Status ────────────────────────────────────────────────────────

const APPT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  NO_SHOW:   "bg-gray-100 text-gray-600 border-gray-200",
};

const APPT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW:   "No Show",
};

// ── Payment Status ────────────────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  INITIATED: "bg-gray-100 text-gray-600 border-gray-200",
  CREATED:   "bg-blue-50 text-blue-700 border-blue-200",
  SUCCESS:   "bg-green-50 text-green-700 border-green-200",
  FAILED:    "bg-red-50 text-red-700 border-red-200",
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
  REFUNDED:  "bg-purple-50 text-purple-700 border-purple-200",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  INITIATED: "Initiated",
  CREATED:   "Created",
  SUCCESS:   "Paid",
  FAILED:    "Failed",
  PENDING:   "Pending",
  REFUNDED:  "Refunded",
};

// ── Components ────────────────────────────────────────────────────────────────

interface Props {
  status: string;
  variant: "case" | "appointment" | "payment";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, variant, size = "sm" }: Props) {
  let style = "bg-gray-100 text-gray-600 border-gray-200";
  let label = status;

  if (variant === "case") {
    style = CASE_STATUS_STYLES[status as CaseStatus] ?? style;
    label = CASE_STATUS_LABELS[status as CaseStatus] ?? status;
  } else if (variant === "appointment") {
    style = APPT_STATUS_STYLES[status as AppointmentStatus] ?? style;
    label = APPT_STATUS_LABELS[status as AppointmentStatus] ?? status;
  } else if (variant === "payment") {
    style = PAYMENT_STATUS_STYLES[status as PaymentStatus] ?? style;
    label = PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
  }

  const sizeClass = size === "sm"
    ? "text-[11px] px-2 py-0.5"
    : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
