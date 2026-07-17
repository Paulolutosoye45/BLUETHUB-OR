import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
};

const variantStyles = {
  primary:
    "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40",
  secondary:
    "bg-surface-white text-navy-900 border-[1.5px] border-border hover:border-blue-600 hover:text-blue-600 dark:text-surface-50",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-7 py-3.5 text-[15px] rounded-[10px]",
  lg: "px-8 py-4 text-base rounded-xl",
};

export function MotionButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-shadow cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type MotionLinkProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  href: string;
};

export function MotionLink({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
}: MotionLinkProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold no-underline transition-shadow",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </motion.a>
  );
}
