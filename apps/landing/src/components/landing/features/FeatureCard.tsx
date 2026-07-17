import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/components/common/StaggerGroup";
import type { Feature } from "@/data/features";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(26,79,214,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-[14px] border border-border bg-surface-white p-6 sm:p-8 transition-colors",
        className,
      )}
    >
      {/* Hover gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-blue-400 transition-transform duration-300 group-hover:scale-x-100" />

      <div
        className={cn(
          "mb-5 flex size-[52px] items-center justify-center rounded-[14px] text-2xl",
          feature.iconBg,
        )}
      >
        {typeof feature.icon === "string" ? feature.icon : <feature.icon />}
      </div>

      <h3 className="mb-2.5 text-base font-bold text-navy-900 dark:text-surface-50">
        {feature.title}
      </h3>

      <p className="text-sm leading-[1.7] text-muted">{feature.description}</p>

      <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        {feature.tag}
      </span>
    </motion.div>
  );
}
