import { PRICING_TIERS } from "@/data/pricing";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/common/StaggerGroup";
import { PricingCard } from "./PricingCard";

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface-white py-[60px] sm:py-[80px] lg:py-[100px] dark:bg-navy-600">
      <Container>
        <ScrollReveal>
          <SectionHeading
            label="Pricing"
            title="Simple, school-friendly pricing"
            subtitle="No hidden charges. Start free and scale as your school grows."
          />
        </ScrollReveal>

        <StaggerGroup className="mt-10 grid gap-6 sm:mt-14 md:grid-cols-3" staggerDelay={0.12}>
          {PRICING_TIERS.map((tier) => (
            <StaggerItem key={tier.name}>
              <PricingCard tier={tier} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
