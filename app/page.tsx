// app/page.tsx
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SearchBar from "@/components/landing/SearchBar";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedLawyers from "@/components/landing/FeaturedLawyers";
import PracticeAreas from "@/components/landing/PracticeAreas";
import WhyUs from "@/components/landing/WhyUs";
import Testimonials from "@/components/landing/Testimonials";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <SearchBar />
      <HowItWorks />
      <FeaturedLawyers />
      <PracticeAreas />
      <WhyUs />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}