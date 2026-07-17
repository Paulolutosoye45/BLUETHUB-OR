import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { staggerItem } from "@/components/common/StaggerGroup";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(26,79,214,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="rounded-[14px] border border-border bg-surface-white p-6 sm:p-7 transition-colors dark:bg-navy-500"
    >
      {/* Stars */}
      <div className="mb-3.5 flex gap-0.5">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star
            key={i}
            className="size-3.5 fill-accent-500 text-accent-500"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-5 text-sm leading-[1.75] italic text-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`flex size-[38px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${testimonial.avatarBg}`}
        >
          {testimonial.authorInitials}
        </div>
        <div>
          <div className="text-[13px] font-bold text-navy-900 dark:text-surface-50">
            {testimonial.authorName}
          </div>
          <div className="text-[11px] text-muted">{testimonial.authorRole}</div>
        </div>
      </div>
    </motion.div>
  );
}
