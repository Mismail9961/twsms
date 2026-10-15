import { getSession, dashboardPathForRole } from '@/lib/auth/session'
import { LandingNavbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features'
import { HowItWorksSection } from '@/components/landing/how-it-works'
import { FAQSection } from '@/components/landing/faq'
import { CTASection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/footer'

export default async function HomePage() {
  const session = await getSession()
  const dashboardHref = session ? dashboardPathForRole(session.role) : '/login'

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. Header / Navigation */}
      <LandingNavbar user={session} dashboardHref={dashboardHref} />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection user={session} dashboardHref={dashboardHref} />

        {/* 3. Features Section (Modular - easily add/edit items) */}
        <FeaturesSection />

        {/* 4. How It Works Section */}
        <HowItWorksSection />

        {/* 5. Frequently Asked Questions */}
        <FAQSection />

        {/* 6. Call to Action Banner */}
        <CTASection user={session} dashboardHref={dashboardHref} />
      </main>

      {/* 7. Footer */}
      <LandingFooter />
    </div>
  )
}
