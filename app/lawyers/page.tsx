import Link from "next/link";
import Navbar from "@/components/Navbar";
import LawyersClient from "./LawyersClient";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Find a Lawyer — GoLawyers",
  description: "Browse verified advocates across 20+ practice areas. Filter by specialization, rating, and experience.",
};

export default function LawyersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="bg-[#0D1B2A] px-6 md:px-16 py-16 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)" }}
          />
          <div className="relative max-w-6xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Verified Advocates</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find the Right Lawyer</h1>
            <p className="text-white/50 text-sm max-w-md">
              Every advocate on GoLawyers is manually verified against Bar Council records. Search by specialization to find the perfect match.
            </p>
          </div>
        </section>

        {/* Lawyers grid with filters — client component */}
        <LawyersClient />
      </main>
      <Footer />
    </>
  );
}
