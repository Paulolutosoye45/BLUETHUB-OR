import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem as FAQItemType } from "@/data/faq";

interface FAQItemProps {
  item: FAQItemType;
}

export function FAQItem({ item }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="border-b border-border">
      <button
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-[15px] font-semibold text-navy-900 dark:text-surface-50 sm:py-[22px]"
      >
        <span className="pr-2">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            isOpen && "bg-blue-600 text-white dark:bg-blue-400 dark:text-navy-900",
          )}
        >
          <Plus className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
            role="region"
          >
            <p className="pb-5 text-sm leading-[1.75] text-muted sm:pb-[22px]">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
