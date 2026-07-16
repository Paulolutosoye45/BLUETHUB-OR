import { FAQ_ITEMS } from "@/data/faq";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { FAQItem } from "./FAQItem";

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-[820px] px-5 py-[60px] sm:py-[80px] lg:py-[100px]">
      <ScrollReveal>
        <SectionHeading
          label="FAQ"
          title="Common questions"
          align="center"
          className="mb-10 sm:mb-12"
        />
      </ScrollReveal>

      <div>
        {FAQ_ITEMS.map((item, index) => (
          <ScrollReveal key={item.id} delay={0.05 * index}>
            <FAQItem item={item} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
