import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ContactHero } from "@/components/landing/contact-hero";
import { FAQSection } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import { ClientsSection } from "@/components/landing/testimonials";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { StrategicPartners } from "@/components/landing/Strategicpartners";
import { ServicesSection } from "@/components/landing/service";
import { WeeklyAchievements } from "@/components/landing/achievements";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. Header / Navigation */}
      <LandingNavbar />

      <main className="flex-1">
        <HeroSection user={null} dashboardHref="/login" />

        <WeeklyAchievements />

        <ServicesSection />

        <FeaturesSection />

        <StrategicPartners />

        <HowItWorksSection />

        <ClientsSection />

        <FAQSection />

        {/* 7. Contact Us banner */}
        <ContactHero />
      </main>

      {/* 8. Footer */}
      <LandingFooter />
    </div>
  );
}
