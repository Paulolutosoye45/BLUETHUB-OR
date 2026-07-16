import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/data/pricing";

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(26,79,214,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group flex flex-col rounded-[14px] border p-7 sm:p-9 transition-colors",
        tier.featured
          ? "border-blue-600 bg-gradient-[145deg] from-blue-600 to-blue-700 text-white dark:from-blue-600/80 dark:to-blue-700/80 bg-blue-600"
          : "border-border bg-background",
      )}
    >
      <span
        className={cn(
          "mb-2.5 text-[11px] font-bold uppercase tracking-wider",
          tier.featured ? "text-white/65" : "text-muted",
        )}
      >
        {tier.label}
      </span>

      <h3
        className={cn(
          "mb-6 font-serif text-[22px]",
          tier.featured ? "text-white" : "text-navy-900 dark:text-surface-50",
        )}
      >
        {tier.name}
      </h3>

      <div
        className={cn(
          "font-serif text-[40px] sm:text-[48px] font-bold leading-none",
          tier.featured ? "text-white" : "text-navy-900 dark:text-surface-50",
        )}
      >
        {tier.price}
      </div>

      <span
        className={cn(
          "mb-7 text-[13px]",
          tier.featured ? "text-white/65" : "text-muted",
        )}
      >
        {tier.period}
      </span>

      <ul className="mb-8 flex flex-1 flex-col gap-2">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2.5 border-b pb-2 text-sm leading-[1.5]",
              tier.featured
                ? "border-white/12 text-white/90"
                : "border-border text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                tier.featured
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
              )}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "w-full rounded-lg py-3.5 text-[14px] font-semibold transition-colors cursor-pointer",
          tier.featured
            ? "bg-white text-blue-600 hover:opacity-90"
            : "border-[1.5px] border-border bg-surface-white text-navy-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:text-surface-50",
        )}
      >
        {tier.cta}
      </motion.button>
    </motion.div>
  );
}
