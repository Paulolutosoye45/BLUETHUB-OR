import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/components/common/StaggerGroup";
import type { Feature } from "@/data/features";

interface FeaturedCardProps {
  feature: Feature;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  synced: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-500",
    label: "Synced ✓",
  },
  syncing: {
    bg: "bg-accent-50 dark:bg-accent-500/10",
    text: "text-accent-500",
    label: "Syncing…",
  },
  offline: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600",
    label: "Offline",
  },
};

export function FeaturedCard({ feature }: FeaturedCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(26,79,214,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-[14px] border border-border bg-surface-200 p-6 sm:p-8 transition-colors md:grid md:grid-cols-2 md:gap-8 md:items-center dark:bg-navy-500"
    >
      {/* Hover gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-blue-400 transition-transform duration-300 group-hover:scale-x-100" />

      <div>
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
          </svg>
          {feature.tag}
        </span>
      </div>

      {/* Visual — Recording Queue */}
      {feature.visual && (
        <div className="mt-6 md:mt-0">
          <div className="rounded-[10px] bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {feature.visual.label}
            </div>
            <div className="flex flex-col gap-2">
              {feature.visual.items.map((item) => {
                const style = STATUS_STYLES[item.status];
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-white p-2.5 text-xs dark:bg-navy-600"
                  >
                    <span className="truncate font-semibold text-navy-900 dark:text-surface-50">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-[2px] text-[10px] font-bold",
                        style.bg,
                        style.text,
                      )}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Videos auto-sync on connection · Students access offline
          </p>
        </div>
      )}
    </motion.div>
  );
}
