// components/landing/SearchBar.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SPECIALIZATIONS = [
  "All", "Criminal", "Civil", "Family", "Corporate", "Tax", "Real Estate", "Labour", "IP"
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const router = useRouter();

  const handleSearch = () => {
    router.push(`/lawyers?q=${query}&specialization=${active}`);
  };

  return (
    <section className="bg-white border-b border-[#E2E8F0] px-6 md:px-16 py-5 sticky top-14 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center">
        {/* Input */}
        <div className="flex items-center gap-3 border border-[#E2E8F0] hover:border-[#0D1B2A]/30 focus-within:border-[#0D1B2A] rounded-lg px-4 h-11 flex-1 transition-colors">
          <svg className="w-4 h-4 text-[#94A3B8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, specialization, or city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 outline-none text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] bg-transparent"
          />
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                active === s
                  ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
                  : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D1B2A]/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-semibold text-sm px-5 h-11 rounded-lg transition-all whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </section>
  );
}