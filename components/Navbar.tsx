"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutThunk } from "@/lib/store/authSlice";

const NAV_LINKS = [
  { href: "/lawyers", label: "Find a Lawyer" },
  { href: "/laws", label: "Legal Knowledge" },
  { href: "/how-it-works", label: "How it Works" },
];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push("/login");
  };

  return (
    <nav
      className={`w-full px-6 md:px-10 h-16 flex items-center justify-between fixed top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0D1B2A]/95 backdrop-blur-md shadow-lg shadow-black/10 border-b border-white/5"
          : "bg-[#0D1B2A]"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-xl text-white tracking-tight flex items-center gap-1 flex-shrink-0"
      >
        <span className="font-black">Go</span>
        <span
          className="font-black"
          style={{ color: "var(--gold)" }}
        >
          Lawyers
        </span>
      </Link>

      {/* Center Nav Links */}
      <ul className="hidden md:flex items-center gap-1 list-none">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-white bg-white/8"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "var(--gold)" }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {isAuthenticated && user ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-sm text-white/80 hover:text-white transition-colors group"
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                  color: "var(--navy)",
                  boxShadow: "0 2px 8px rgb(201 168 76 / 0.4)",
                }}
              >
                {user.fullName?.[0]?.toUpperCase()}
              </span>
              <span className="hidden sm:inline font-medium">{user.fullName?.split(" ")[0]}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-4 py-1.5 rounded-lg transition-all hover:bg-white/5"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 px-4 py-1.5 rounded-lg transition-all hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--gold)",
                color: "var(--navy)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--gold-light)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "var(--gold)")}
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}