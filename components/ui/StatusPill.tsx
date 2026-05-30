type Status = string;

interface StatusConfig {
  dot: string;
  bg: string;
  text: string;
  border: string;
  label?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Case Statuses
  OPEN:        { dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Open" },
  ASSIGNED:    { dot: "#8B5CF6", bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", label: "Assigned" },
  IN_PROGRESS: { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "In Progress" },
  RESOLVED:    { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "Resolved" },
  CLOSED:      { dot: "#6B7280", bg: "#F9FAFB", text: "#374151", border: "#E5E7EB", label: "Closed" },
  CANCELLED:   { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", label: "Cancelled" },

  // User status
  ACTIVE:      { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "Active" },

  // Appointment Statuses
  PENDING:     { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "Pending" },
  CONFIRMED:   { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "Confirmed" },
  COMPLETED:   { dot: "#059669", bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7", label: "Completed" },
  NO_SHOW:     { dot: "#F97316", bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA", label: "No Show" },

  // Payment Statuses
  INITIATED:   { dot: "#6B7280", bg: "#F9FAFB", text: "#374151", border: "#E5E7EB", label: "Initiated" },
  CREATED:     { dot: "#F59E0B", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "Created" },
  SUCCESS:     { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "Paid" },
  PAID:        { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "Paid" },
  FAILED:      { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", label: "Failed" },
  REFUNDED:    { dot: "#8B5CF6", bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", label: "Refunded" },
};

const DEFAULT: StatusConfig = {
  dot: "#6B7280",
  bg: "#F9FAFB",
  text: "#374151",
  border: "#E5E7EB",
};

export default function StatusPill({ status }: { status: Status }) {
  if (!status) return null;
  const cfg = STATUS_MAP[status] ?? DEFAULT;
  const label = cfg.label ?? status.replace(/_/g, " ");

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {label}
    </span>
  );
}
