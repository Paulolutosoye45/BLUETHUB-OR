import { motion } from "framer-motion";
import { HERO_STATS } from "@/data/navigation";
import { Container } from "@/components/common/Container";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute -top-5 right-[-100px] size-[300px] rounded-full bg-blue-500/[0.12] blur-3xl sm:size-[500px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container className="relative grid items-center gap-10 py-12 sm:gap-15 sm:py-16 lg:grid-cols-2 lg:gap-15 lg:py-[80px]">
        <ScrollReveal delay={0}>
          <HeroContent />
        </ScrollReveal>

        <ScrollReveal delay={0.2} direction="right">
          <HeroVisual />
        </ScrollReveal>

        {/* Hero Stats — full width below grid */}
        <div className="col-span-full mt-6 sm:mt-12">
          <div className="flex flex-wrap gap-7 sm:gap-9">
            {HERO_STATS.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={0.4 + index * 0.1} className="flex flex-col">
                <span className="font-serif text-[26px] sm:text-[30px] font-bold text-navy-900 dark:text-surface-50">
                  {stat.value}
                </span>
                <span className="mt-0.5 text-xs text-muted">{stat.label}</span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
