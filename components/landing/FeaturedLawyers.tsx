// components/landing/FeaturedLawyers.jsx
import Link from "next/link";

const LAWYERS = [
  {
    initials: "AS",
    name: "Adv. Ananya Sharma",
    title: "Senior Criminal Counsel",
    location: "New Delhi",
    rating: "4.9",
    reviews: 182,
    experience: "12 yrs",
    fee: "₹3,500",
    tags: ["Criminal Law", "High Court", "NDPS Act"],
    color: "bg-[#0D1B2A]",
  },
  {
    initials: "PM",
    name: "Adv. Prakash Mehta",
    title: "Corporate Advocate",
    location: "Mumbai",
    rating: "4.6",
    reviews: 97,
    experience: "8 yrs",
    fee: "₹5,000",
    tags: ["Corporate", "M&A", "Startups"],
    color: "bg-[#1A3050]",
  },
  {
    initials: "NK",
    name: "Adv. Nisha Kapoor",
    title: "Family Law Specialist",
    location: "Bengaluru",
    rating: "4.8",
    reviews: 143,
    experience: "15 yrs",
    fee: "₹2,800",
    tags: ["Family Law", "Divorce", "Custody"],
    color: "bg-[#C9A84C]",
    textDark: true,
  },
];

export default function FeaturedLawyers() {
  return (
    <section className="bg-white px-6 md:px-16 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Top Advocates</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">Featured Lawyers</h2>
          </div>
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D1B2A] border border-[#E2E8F0] hover:border-[#0D1B2A]/40 px-5 py-2.5 rounded-lg transition-all"
          >
            View All Lawyers
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LAWYERS.map((lawyer) => (
            <div
              key={lawyer.name}
              className="border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Card top */}
              <div className={`${lawyer.color} px-5 pt-6 pb-5`}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                      lawyer.textDark
                        ? "bg-white/20 text-[#0D1B2A]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {lawyer.initials}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    lawyer.textDark ? "bg-white/20 text-[#0D1B2A]" : "bg-white/10 text-white"
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {lawyer.rating}
                  </div>
                </div>
                <h3 className={`font-bold text-base mb-0.5 ${lawyer.textDark ? "text-[#0D1B2A]" : "text-white"}`}>
                  {lawyer.name}
                </h3>
                <p className={`text-xs ${lawyer.textDark ? "text-[#0D1B2A]/60" : "text-white/50"}`}>
                  {lawyer.title} · {lawyer.location}
                </p>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 bg-white">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {lawyer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] mb-4">
                  <span>{lawyer.reviews} reviews</span>
                  <span>{lawyer.experience} experience</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#0D1B2A] text-base">{lawyer.fee}</p>
                    <p className="text-[11px] text-[#94A3B8]">per consultation</p>
                  </div>
                  <Link
                    href={`/lawyers/${lawyer.initials.toLowerCase()}`}
                    className="text-sm font-semibold bg-[#0D1B2A] hover:bg-[#1A3050] text-white px-4 py-2 rounded-lg transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}