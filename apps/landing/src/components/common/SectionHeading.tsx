import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ScrollReveal";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <ScrollReveal className={cn("mb-14", align === "center" && "text-center", className)}>
      {label && (
        <span className="mb-3.5 inline-block text-[11px] font-bold uppercase tracking-[1.2px] text-blue-600 dark:text-blue-400">
          {label}
        </span>
      )}
      <h2
        className={cn(
          "font-serif text-[clamp(28px,3.5vw,46px)] leading-[1.2] tracking-[-0.3px] text-navy-900 dark:text-surface-50",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 max-w-[560px] text-base leading-[1.75] text-muted">
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}
