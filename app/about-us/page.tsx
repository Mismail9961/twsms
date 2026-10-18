import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { AboutSection } from "@/components/landing/about";
import { ContactHero } from "@/components/landing/contact-hero";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "About Us | Technology World",
  description:
    "Technology World is a leading network integration company based in Pakistan, empowering businesses through technology.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header / Navigation */}
      <LandingNavbar />

      <main className="flex-1">
        {/* About Us: intro, vision, mission, key strategies */}
        <AboutSection />

        {/* Contact Us banner */}
        <ContactHero />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}