import { TESTIMONIALS } from "@/data/testimonials";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/common/StaggerGroup";
import { TestimonialCard } from "./TestimonialCard";

export function Testimonials() {
  return (
    <section className="bg-background py-[60px] sm:py-[80px] lg:py-[100px]">
      <Container>
        <ScrollReveal>
          <SectionHeading
            label="What people say"
            title="Real schools, real impact"
          />
        </ScrollReveal>

        <StaggerGroup className="mt-10 grid gap-6 sm:mt-14 md:grid-cols-3" staggerDelay={0.12}>
          {TESTIMONIALS.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
