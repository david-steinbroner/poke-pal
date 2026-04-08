"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  match: (p: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", match: (p) => p === "/" || p.startsWith("/counter") },
  { href: "/leagues", label: "Leagues", match: (p) => p === "/leagues" || p.startsWith("/league/") },
  { href: "/teams", label: "Teams", match: (p) => p.startsWith("/teams") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 items-center justify-center py-3 text-sm font-medium transition-colors ${
                active
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
