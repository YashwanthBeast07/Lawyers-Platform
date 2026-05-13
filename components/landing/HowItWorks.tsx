// components/landing/HowItWorks.jsx

const STEPS = [
  {
    step: "01",
    title: "Submit Your Case",
    desc: "Describe your legal issue in detail. Our platform categorizes it and matches it to the right practice area instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Browse & Choose a Lawyer",
    desc: "Review verified advocate profiles, ratings, specializations, and fees. Assign a lawyer to your case with one click.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Book a Consultation",
    desc: "Pick a date and time that works. Get an in-person or video consultation confirmed within 24 hours.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Pay Securely & Track",
    desc: "Pay via Razorpay with full HMAC verification. Track case status, documents, and hearings in real time.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#FAFAF7] px-6 md:px-16 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">The Process</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] leading-tight">
              How GoLawyers Works
            </h2>
            <p className="text-[#64748B] text-sm max-w-xs leading-relaxed">
              From submitting your case to getting it resolved — a simple, transparent process.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-6 relative group hover:border-[#C9A84C]/40 hover:shadow-md transition-all"
            >
              {/* Step number */}
              <span className="text-[60px] font-bold text-[#F1F5F9] absolute top-4 right-5 leading-none select-none">
                {step.step}
              </span>

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-[#0D1B2A] text-[#C9A84C] flex items-center justify-center mb-5">
                {step.icon}
              </div>

              <h3 className="font-bold text-[#0D1B2A] text-base mb-2">{step.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{step.desc}</p>

              {/* Connector arrow (hidden on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-[#E2E8F0] rounded-full items-center justify-center">
                  <svg className="w-3 h-3 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}