import type { CaseStatus, AppointmentStatus, PaymentStatus } from "@/lib/types";

// ── Case Status ───────────────────────────────────────────────────────────────

const CASE_STATUS_STYLES: Record<CaseStatus, string> = {
  OPEN:                    "bg-blue-50 text-blue-700 border-blue-200",
  DRAFT:                   "bg-slate-50 text-slate-600 border-slate-200",
  AWAITING_CLIENT_REVIEW:  "bg-amber-50 text-amber-700 border-amber-200",
  AWAITING_DOCUMENTS:      "bg-orange-50 text-orange-700 border-orange-200",
  UNDER_REVIEW:            "bg-yellow-50 text-yellow-700 border-yellow-200",
  AWAITING_PAYMENT:        "bg-rose-50 text-rose-700 border-rose-200",
  ASSIGNED:                "bg-purple-50 text-purple-700 border-purple-200",
  ACTIVE:                  "bg-indigo-50 text-indigo-700 border-indigo-200",
  AWAITING_CLIENT_ACTION:  "bg-amber-50 text-amber-800 border-amber-300",
  FILING_IN_PROGRESS:      "bg-cyan-50 text-cyan-700 border-cyan-200",
  FILED:                   "bg-teal-50 text-teal-700 border-teal-200",
  HEARING_SCHEDULED:       "bg-violet-50 text-violet-700 border-violet-200",
  AWAITING_COURT_UPDATE:   "bg-purple-50 text-purple-600 border-purple-200",
  NEGOTIATION:             "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  SETTLEMENT_PROPOSED:     "bg-pink-50 text-pink-700 border-pink-200",
  RESOLVED:                "bg-green-50 text-green-700 border-green-200",
  AWAITING_FINAL_PAYMENT:  "bg-rose-50 text-rose-700 border-rose-200",
  IN_PROGRESS:             "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED:                  "bg-gray-100 text-gray-600 border-gray-200",
  ARCHIVED:                "bg-gray-50 text-gray-500 border-gray-200",
  DISPUTED:                "bg-red-50 text-red-700 border-red-200",
  CANCELLED:               "bg-red-50 text-red-700 border-red-200",
};

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN:                   "Open",
  DRAFT:                  "Draft",
  AWAITING_CLIENT_REVIEW: "Awaiting Review",
  AWAITING_DOCUMENTS:     "Awaiting Docs",
  UNDER_REVIEW:           "Under Review",
  AWAITING_PAYMENT:       "Awaiting Payment",
  ASSIGNED:               "Assigned",
  ACTIVE:                 "Active",
  AWAITING_CLIENT_ACTION: "Action Required",
  FILING_IN_PROGRESS:     "Filing",
  FILED:                  "Filed",
  HEARING_SCHEDULED:      "Hearing Scheduled",
  AWAITING_COURT_UPDATE:  "Awaiting Court",
  NEGOTIATION:            "Negotiation",
  SETTLEMENT_PROPOSED:    "Settlement Proposed",
  RESOLVED:               "Resolved",
  AWAITING_FINAL_PAYMENT: "Awaiting Payment",
  IN_PROGRESS:            "In Progress",
  CLOSED:                 "Closed",
  ARCHIVED:               "Archived",
  DISPUTED:               "Disputed",
  CANCELLED:              "Cancelled",
};

// ── Appointment Status ────────────────────────────────────────────────────────

const APPT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:        "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:      "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  COMPLETED:      "bg-green-50 text-green-700 border-green-200",
  CANCELLED:      "bg-red-50 text-red-700 border-red-200",
  NO_SHOW:        "bg-gray-100 text-gray-600 border-gray-200",
  MISSED_CLIENT:  "bg-orange-50 text-orange-700 border-orange-200",
  MISSED_LAWYER:  "bg-rose-50 text-rose-700 border-rose-200",
};

const APPT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:        "Pending",
  CONFIRMED:      "Confirmed",
  IN_PROGRESS:    "In Progress",
  COMPLETED:      "Completed",
  CANCELLED:      "Cancelled",
  NO_SHOW:        "No Show",
  MISSED_CLIENT:  "Missed (Client)",
  MISSED_LAWYER:  "Missed (Lawyer)",
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
  let label = status.replace(/_/g, " ");

  if (variant === "case") {
    style = CASE_STATUS_STYLES[status as CaseStatus] ?? style;
    label = CASE_STATUS_LABELS[status as CaseStatus] ?? label;
  } else if (variant === "appointment") {
    style = APPT_STATUS_STYLES[status as AppointmentStatus] ?? style;
    label = APPT_STATUS_LABELS[status as AppointmentStatus] ?? label;
  } else if (variant === "payment") {
    style = PAYMENT_STATUS_STYLES[status as PaymentStatus] ?? style;
    label = PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? label;
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
