import { PageTransition } from "@/components/common/PageTransition";
import { Navbar } from "@/components/landing/navbar/Navbar";
import { ComingSoonBand } from "@/components/landing/coming-soon/ComingSoonBand";
import { Hero } from "@/components/landing/hero/Hero";
import { TrustBar } from "@/components/landing/trust/TrustBar";
import { Features } from "@/components/landing/features/Features";
import { Roles } from "@/components/landing/roles/Roles";
import { HowItWorks } from "@/components/landing/how-it-works/HowItWorks";
import { StatsBand } from "@/components/landing/stats/StatsBand";
import { Testimonials } from "@/components/landing/testimonials/Testimonials";
import { Pricing } from "@/components/landing/pricing/Pricing";
import { FAQ } from "@/components/landing/faq/FAQ";
import { CTABanner } from "@/components/landing/cta/CTABanner";
import { Footer } from "@/components/landing/footer/Footer";

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <ComingSoonBand />
        <Hero />
        <TrustBar />
        <Features />
        <Roles />
        <HowItWorks />
        <StatsBand />
        <Testimonials />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </PageTransition>
  );
}
