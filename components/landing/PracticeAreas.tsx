// components/landing/PracticeAreas.jsx

const AREAS = [
  { label: "Criminal Law", count: "320+ lawyers", icon: "⚖️" },
  { label: "Family Law", count: "210+ lawyers", icon: "🏠" },
  { label: "Corporate Law", count: "180+ lawyers", icon: "🏢" },
  { label: "Civil Law", count: "260+ lawyers", icon: "📜" },
  { label: "Tax Law", count: "140+ lawyers", icon: "🧾" },
  { label: "Real Estate", count: "155+ lawyers", icon: "🏗️" },
  { label: "Labour Law", count: "120+ lawyers", icon: "👷" },
  { label: "Intellectual Property", count: "90+ lawyers", icon: "💡" },
];

export default function PracticeAreas() {
  return (
    <section className="bg-[#FAFAF7] px-6 md:px-16 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Specializations</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">Browse by Practice Area</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AREAS.map((area) => (
            <button
              key={area.label}
              className="group bg-white border border-[#E2E8F0] hover:border-[#C9A84C]/50 hover:shadow-md rounded-2xl px-5 py-5 text-left transition-all"
            >
              <div className="text-2xl mb-3">{area.icon}</div>
              <h3 className="font-bold text-[#0D1B2A] text-sm mb-1 group-hover:text-[#C9A84C] transition-colors">
                {area.label}
              </h3>
              <p className="text-xs text-[#94A3B8]">{area.count}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}