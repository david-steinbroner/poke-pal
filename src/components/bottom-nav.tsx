"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Trophy, Users } from "lucide-react";
import { LEAGUE_IDS } from "@/lib/constants";

const STORAGE_KEY = "poke-pal:lastLeague";

function getLeagueHref(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LEAGUE_IDS as readonly string[]).includes(stored)) {
      return `/league/${stored}`;
    }
  } catch {}
  return "/leagues";
}

type NavItem = {
  href: string;
  label: string;
  icon: typeof Search;
  match: (p: string) => boolean;
};

const STATIC_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Search", icon: Search, match: (p: string) => p === "/" || p.startsWith("/counter") },
  { href: "/leagues", label: "Leagues", icon: Trophy, match: (p: string) => p === "/leagues" || p.startsWith("/league/") },
  { href: "/teams", label: "Teams", icon: Users, match: (p: string) => p.startsWith("/teams") },
];

export function BottomNav() {
  const pathname = usePathname();
  const [leagueHref, setLeagueHref] = useState("/leagues");

  useEffect(() => {
    setLeagueHref(getLeagueHref());
  }, []);

  const navItems: NavItem[] = STATIC_NAV_ITEMS.map((item) =>
    item.label === "Leagues" ? { ...item, href: leagueHref } : item,
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 pt-2.5 pb-1.5 text-xs font-medium transition-colors ${
                active
                  ? "text-primary font-semibold"
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
