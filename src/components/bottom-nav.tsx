"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Swords, Trophy, Users } from "lucide-react";

function RocketR({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="52%" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontWeight="900" fontStyle="italic" fontSize="20">R</text>
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (p: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" || p.startsWith("/counter") },
  { href: "/raids", label: "Raids", icon: Swords, match: (p) => p.startsWith("/raids") },
  { href: "/rockets", label: "Rockets", icon: RocketR, match: (p) => p.startsWith("/rockets") },
  { href: "/leagues", label: "Leagues", icon: Trophy, match: (p) => p === "/leagues" || p.startsWith("/league/") },
  { href: "/teams", label: "Teams", icon: Users, match: (p) => p.startsWith("/teams") },
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-1 basis-0 flex-col items-center justify-center py-2.5 transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              }`}
            >
              <div className={`rounded-full px-4 py-1 ${active ? "bg-foreground/10" : ""}`}>
                <Icon className="size-6 [stroke-width:1.5]" />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
