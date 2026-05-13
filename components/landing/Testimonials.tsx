// components/landing/Testimonials.jsx

const REVIEWS = [
  {
    initials: "VG",
    name: "Vikram Gupta",
    role: "Client · Criminal Case",
    review:
      "GoLawyers connected me with an excellent criminal advocate within 24 hours. The case tracking dashboard kept me informed at every step. Truly professional.",
    rating: 5,
    color: "bg-[#0D1B2A]",
  },
  {
    initials: "SM",
    name: "Sunita Mehrotra",
    role: "Client · Family Law",
    review:
      "The platform is clean and easy to use. I found a specialist for my divorce case, booked a consultation, and paid — all within 15 minutes. Outstanding service.",
    rating: 5,
    color: "bg-[#C9A84C]",
    textDark: true,
  },
  {
    initials: "AK",
    name: "Aditya Khurana",
    role: "Client · Property Dispute",
    review:
      "Finally a legal platform that's transparent about fees. No hidden charges, verified lawyers, and instant notifications. Will recommend to everyone.",
    rating: 5,
    color: "bg-[#1A3050]",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white px-6 md:px-16 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Client Stories</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">What Our Clients Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md transition-all">
              {/* Top color bar */}
              <div className={`${r.color} h-1.5`} />

              <div className="p-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-sm text-[#64748B] leading-relaxed mb-6">&quot;{r.review}&quot;</p>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-xs font-bold ${r.textDark ? "text-[#0D1B2A]" : "text-white"}`}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0D1B2A]">{r.name}</p>
                    <p className="text-xs text-[#94A3B8]">{r.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}