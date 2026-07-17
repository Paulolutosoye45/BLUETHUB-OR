import { NAV_LINKS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="border-b border-border bg-surface-white px-5 pb-7 pt-5 shadow-xl shadow-black/15 dark:bg-navy-600 lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onClose}
          className="block border-b border-border py-3 text-[15px] font-medium text-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        >
          {link.label}
        </a>
      ))}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-medium text-foreground">Dark mode</span>
        <ThemeToggle />
      </div>
    </div>
  );
}
