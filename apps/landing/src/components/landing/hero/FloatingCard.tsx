import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  position: "top-right" | "bottom-left";
  dotColor: string;
  text: string;
  className?: string;
}

const positionStyles = {
  "top-right": "-top-4 -right-6 md:-top-4 md:-right-6",
  "bottom-left": "bottom-3 -left-7 md:bottom-3 md:-left-7",
};

export function FloatingCard({ position, dotColor, text, className }: FloatingCardProps) {
  return (
    <motion.div
      className={cn(
        "absolute z-10 flex items-center gap-2 rounded-xl border border-border bg-surface-white px-4 py-3 text-xs font-medium shadow-lg max-md:hidden",
        positionStyles[position],
        className,
      )}
      animate={{
        y: position === "top-right" ? [0, -6, 0] : [0, 6, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      {text}
    </motion.div>
  );
}
