import { getSession, dashboardPathForRole } from "@/lib/auth/session";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { NetworkHero } from "@/components/landing/network-hero";
import { ContactHero } from "@/components/landing/contact-hero";
import { FAQSection } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import { TestimonialsSection } from "@/components/landing/testimonials";

export default async function HomePage() {
  const session = await getSession();
  const dashboardHref = session ? dashboardPathForRole(session.role) : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. Header / Navigation */}
      <LandingNavbar user={session} dashboardHref={dashboardHref} />

      <main className="flex-1">
        {/* 2. Hero Section (ticket mockup + sign in) */}
        <HeroSection user={session} dashboardHref={dashboardHref} />

        {/* 3. Our Services (Network Solutions) */}
        <NetworkHero />

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
