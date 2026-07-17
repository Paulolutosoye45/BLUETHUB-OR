import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/components/common/StaggerGroup";
import type { Role } from "@/data/roles";

interface RoleCardProps {
  role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
  const Icon = role.icon;
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(26,79,214,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group flex flex-col rounded-[14px] border border-border bg-background p-6 sm:p-8 text-center transition-colors",
        "border-t-4",
        role.borderColor,
      )}
    >
      <span className="mb-4 inline-flex size-[52px] items-center justify-center rounded-[14px] bg-accent-50 text-accent-500 dark:bg-accent-500/10">
        <Icon className="size-6" />
      </span>

      <h3 className="mb-2.5 text-lg font-bold text-navy-900 dark:text-surface-50">
        {role.title}
      </h3>

      <p className="text-sm leading-[1.7] text-muted">{role.description}</p>

      <ul className="mt-5 space-y-1.5 text-left">
        {role.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-2 border-b border-border pb-1.5 text-[13px] text-foreground last:border-b-0"
          >
            <span className="shrink-0 font-bold text-emerald-500">✓</span>
            {perk}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
