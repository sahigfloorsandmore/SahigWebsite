"use client";

import Navbar from "@/components/Navbar";
import HeroOption2 from "@/components/HeroOption2";
import StatsSection from "@/components/StatsSection";
import PartnersSection from "@/components/PartnersSection";
import ServiceCards from "@/components/ServiceCards";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroOption2 />
      <StatsSection />
      <PartnersSection />
      <ServiceCards />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
