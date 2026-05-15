import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "How It Works — GoLawyers",
  description: "Learn how GoLawyers connects you with verified legal advocates in 3 simple steps.",
};

const STEPS = [
  {
    number: "01",
    title: "Submit Your Case",
    description:
      "Describe your legal issue in detail — the type of case, urgency, and any relevant documents. Our platform uses this to match you with the most suitable verified advocate.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get Matched with a Lawyer",
    description:
      "Browse profiles of verified Bar Council advocates filtered by practice area and experience. Review ratings, fees, and read client reviews before making your choice.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M10.5 7.5v6m3-3h-6" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Book a Consultation",
    description:
      "Schedule an online or in-person appointment at your convenience. Communicate securely and track every update from your personalised dashboard.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Secure Payment",
    description:
      "Pay consultation fees securely via Razorpay. All transactions are encrypted and protected. Invoices and payment history are available on your dashboard.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "How are lawyers verified?",
    a: "Every advocate on GoLawyers is manually verified by our admin team against their Bar Council of India enrollment records before they can accept any cases.",
  },
  {
    q: "Can I change my lawyer after assignment?",
    a: "Yes. If a case has not yet moved to 'In Progress', you can reassign it to a different lawyer from the Find a Lawyer page.",
  },
  {
    q: "Is my information kept private?",
    a: "All case details and personal information are encrypted. Lawyers only see information relevant to the case they are assigned to.",
  },
  {
    q: "What if I need urgent legal help?",
    a: "Filter lawyers by availability and book a same-day online consultation. Most verified advocates on GoLawyers respond within 2 hours.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support UPI, credit/debit cards, net banking, and wallets via Razorpay — India's most trusted payment gateway.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="bg-[#0D1B2A] px-6 md:px-16 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)" }} />
          <div className="relative max-w-6xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Simple Process</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Legal Help in <span className="text-[#C9A84C]">4 Easy Steps</span>
            </h1>
            <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
              GoLawyers makes it simple to find, hire, and work with verified legal advocates across India — from case submission to resolution.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-[#FAFAF7] px-6 md:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STEPS.map((step) => (
                <div key={step.number} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0D1B2A] flex items-center justify-center text-[#C9A84C] shrink-0 group-hover:bg-[#1A3050] transition-all">
                      {step.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] uppercase">Step {step.number}</span>
                      <h2 className="text-base font-bold text-[#0D1B2A] mt-0.5 mb-2">{step.title}</h2>
                      <p className="text-sm text-[#64748B] leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white px-6 md:px-16 py-16 border-t border-[#F1F5F9]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-2">FAQ</p>
              <h2 className="text-2xl font-bold text-[#0D1B2A]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="border border-[#E2E8F0] rounded-xl px-6 py-5">
                  <p className="font-semibold text-[#0D1B2A] text-sm mb-2">{faq.q}</p>
                  <p className="text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0D1B2A] px-6 md:px-16 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Get Started</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to resolve your legal matter?</h2>
          <p className="text-white/50 text-sm mb-8">Join thousands of clients who found their advocate on GoLawyers.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-bold text-sm px-6 py-3 rounded-lg transition-all">
              Create Free Account
            </Link>
            <Link href="/lawyers" className="border border-white/20 hover:border-white/50 text-white text-sm font-medium px-6 py-3 rounded-lg transition-all">
              Browse Lawyers
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
