"use client";

import { useState } from "react";
import { MenuSheet } from "./menu-sheet";

type Tab = "battle" | "leagues";

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-background pb-2 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Poke Pal</h1>
        <button
          className="flex min-h-11 min-w-11 items-center justify-center"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="mt-2 flex gap-2">
        <button
          className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "battle"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTabChange("battle")}
        >
          Battle
        </button>
        <button
          className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "leagues"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTabChange("leagues")}
        >
          Leagues
        </button>
      </nav>
      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
