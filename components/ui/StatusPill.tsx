type Status = string;

const STATUS_MAP: Record<string, string> = {
  // Case Statuses
  OPEN: "bg-blue-50 text-blue-700 border border-blue-100",
  ASSIGNED: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 border border-yellow-100",
  RESOLVED: "bg-green-50 text-green-700 border border-green-100",
  CLOSED: "bg-slate-100 text-slate-500 border border-slate-200",
  
  // Custom user ones
  ACTIVE: "bg-blue-50 text-blue-700 border border-blue-100",
  
  // Appointment / General Statuses
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-100",
  CONFIRMED: "bg-green-50 text-green-700 border border-green-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
  NO_SHOW: "bg-orange-50 text-orange-700 border border-orange-100",
  
  // Payment Statuses
  INITIATED: "bg-slate-50 text-slate-700 border border-slate-100",
  CREATED: "bg-yellow-50 text-yellow-700 border border-yellow-100",
  SUCCESS: "bg-green-50 text-green-700 border border-green-100",
  PAID: "bg-green-50 text-green-700 border border-green-100",
  FAILED: "bg-red-50 text-red-600 border border-red-100",
  REFUNDED: "bg-purple-50 text-purple-700 border border-purple-100",
};

export default function StatusPill({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_MAP[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
