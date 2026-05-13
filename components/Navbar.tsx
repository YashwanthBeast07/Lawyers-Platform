// components/Navbar.jsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0D1B2A] px-8 h-14 flex items-center justify-between fixed top-0 z-50">
      <Link href="/" className="font-serif text-xl text-white tracking-tight">
        Lex<span className="text-[#C9A84C]">.</span>In
      </Link>

      <ul className="hidden md:flex items-center gap-8 list-none">
        <li>
          <Link href="/lawyers" className="text-white/60 hover:text-white text-sm transition-colors">
            Find a Lawyer
          </Link>
        </li>
        <li>
          <Link href="/laws" className="text-white/60 hover:text-white text-sm transition-colors">
            Legal Knowledge
          </Link>
        </li>
        <li>
          <Link href="/how-it-works" className="text-white/60 hover:text-white text-sm transition-colors">
            How it Works
          </Link>
        </li>
      </ul>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-4 py-1.5 rounded-md transition-all"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] px-4 py-1.5 rounded-md transition-all"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}