interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-2">{eyebrow}</p>
      )}
      <h2 className="text-xl font-bold text-[#0D1B2A]">{title}</h2>
      {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
    </div>
  );
}
