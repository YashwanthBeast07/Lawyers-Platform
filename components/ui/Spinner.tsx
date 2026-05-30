interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { ring: "w-4 h-4", border: "border-[2px]" },
  md: { ring: "w-6 h-6", border: "border-[2.5px]" },
  lg: { ring: "w-9 h-9", border: "border-[3px]" },
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const s = SIZE_MAP[size];
  return (
    <div
      className={`${s.ring} ${s.border} rounded-full ${className}`}
      style={{
        borderColor: "var(--gold)",
        borderTopColor: "transparent",
        animation: "spin 0.75s linear infinite",
      }}
      aria-label="Loading"
    />
  );
}

// Full-page centered spinner
export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
      style={{ color: "var(--text-muted)" }}
    >
      <div className="relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
          style={{
            background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
            color: "var(--navy)",
          }}
        >
          G
        </div>
        <div
          className="absolute -inset-2 rounded-3xl border-2 border-t-transparent"
          style={{
            borderColor: "var(--gold)",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
