"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Trophy, Users } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const STATIC_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" || p.startsWith("/counter") },
  { href: "/leagues", label: "Leagues", icon: Trophy, match: (p: string) => p === "/leagues" || p.startsWith("/league/") },
  { href: "/teams", label: "Teams", icon: Users, match: (p: string) => p.startsWith("/teams") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {STATIC_NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 pt-2.5 pb-1.5 text-[11px] font-medium transition-colors ${
                active
                  ? "text-foreground/70 font-semibold"
                  : "text-muted-foreground/50"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
