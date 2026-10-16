import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { NetworkHero } from "@/components/landing/network-hero";
import { ContactHero } from "@/components/landing/contact-hero";
import { FAQSection } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. Header / Navigation */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section (ticket mockup + sign in) */}
        <HeroSection user={null} dashboardHref="/login" />

        {/* 3. Our Services (Network Solutions) */}
        <NetworkHero />

        <FeaturesSection />

        <HowItWorksSection />

        <TestimonialsSection />

        <FAQSection />

        {/* 7. Contact Us banner */}
        <ContactHero />
      </main>

      {/* 8. Footer */}
      <LandingFooter />
    </div>
  );
}
