"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Trophy, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Search", icon: Search, match: (p: string) => p === "/" || p.startsWith("/counter") },
  { href: "/leagues", label: "Leagues", icon: Trophy, match: (p: string) => p === "/leagues" || p.startsWith("/league/") },
  { href: "/teams", label: "Teams", icon: Users, match: (p: string) => p.startsWith("/teams") },
] as const;

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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground"
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
