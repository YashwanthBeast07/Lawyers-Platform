// components/landing/Footer.jsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] px-6 md:px-16 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-white">
              Go<span className="text-[#C9A84C]">Lawyers</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mt-3 max-w-50">
              India&apos;s trusted platform for verified legal help.
            </p>
            <div className="flex gap-3 mt-5">
              {["Twitter", "LinkedIn", "Instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-white/40 hover:text-white transition-all text-xs"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Platform</p>
            <ul className="space-y-3">
              {["Find a Lawyer", "Submit a Case", "Book Appointment", "Legal Knowledge"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Company</p>
            <ul className="space-y-3">
              {["About Us", "How it Works", "Careers", "Press"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Legal</p>
            <ul className="space-y-3">
              {["Terms of Service", "Privacy Policy", "Refund Policy", "Cookie Policy"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">© 2025 GoLawyers. All rights reserved.</p>
          <p className="text-white/25 text-xs">Secured by <span className="text-white/40">Razorpay</span> · Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}