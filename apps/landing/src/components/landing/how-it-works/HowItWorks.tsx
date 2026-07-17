import { HOW_IT_WORKS_STEPS } from "@/data/how-it-works";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/common/StaggerGroup";

export function HowItWorks() {
  return (
    <section id="how" className="bg-background py-[60px] sm:py-[80px] lg:py-[100px]">
      <Container>
        <ScrollReveal>
          <SectionHeading
            label="How it works"
            title="Up and running in minutes"
          />
        </ScrollReveal>

        <div className="relative mt-10 sm:mt-15">
          {/* Dotted connecting line — desktop only */}
          <div className="absolute top-[30px] left-[10%] right-[10%] hidden h-px border-t-[1px] border-dashed border-border lg:block" />

          <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
            {HOW_IT_WORKS_STEPS.map((step) => (
              <StaggerItem key={step.number}>
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-5 flex size-[60px] items-center justify-center rounded-full border-2 border-blue-100 bg-surface-white font-serif text-[22px] font-bold text-blue-600 dark:border-blue-900/30 dark:bg-navy-600 dark:text-blue-400">
                    {step.number}
                  </div>
                  <h4 className="mb-2 text-sm font-bold text-navy-900 dark:text-surface-50">
                    {step.title}
                  </h4>
                  <p className="text-[13px] leading-[1.65] text-muted">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
