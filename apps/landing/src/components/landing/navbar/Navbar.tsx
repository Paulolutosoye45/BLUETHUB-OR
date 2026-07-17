import { useState, useCallback } from "react";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-50/95 backdrop-blur-lg dark:bg-navy-800/96">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:h-17 lg:px-[5vw]">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
            className="flex flex-col gap-1.5 p-1 lg:hidden"
          >
            {isOpen ? (
              <X className="size-6 text-navy-900 dark:text-surface-50" />
            ) : (
              <Menu className="size-6 text-navy-900 dark:text-surface-50" />
            )}
          </button>
        </div>
      </div>
      <MobileMenu isOpen={isOpen} onClose={closeMenu} />
    </header>
  );
}
