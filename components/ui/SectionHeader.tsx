interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-1">
      <div>
        {eyebrow && (
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
            style={{ color: "var(--gold)" }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "var(--text)", fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm mt-1 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
