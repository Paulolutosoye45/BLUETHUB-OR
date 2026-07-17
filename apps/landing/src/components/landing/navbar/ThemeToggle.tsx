import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex size-7 items-center border justify-center rounded-full transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30  ${className ?? ""} `}
    >
      <Sun
        className={`absolute size-[14px] transition-all duration-300 text-black  ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute size-[14px] transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
