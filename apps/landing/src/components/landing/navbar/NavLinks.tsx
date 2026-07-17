import { NAV_LINKS } from "@/data/navigation";

export function NavLinks() {
  return (
    <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-navy-400 transition-colors hover:text-blue-600 dark:text-navy-300 dark:hover:text-blue-400"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
