"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { isCollapsed, setCollapsed } from "@/lib/home-collapse-storage";

type CollapsibleSectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

export function CollapsibleSection({
  id,
  label,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === id) {
      // Linked directly — force open and scroll into view
      setOpen(true);
      setCollapsed(`section:${id}`, false);
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setOpen(!isCollapsed(`section:${id}`));
    }
    setMounted(true);
  }, [id]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setCollapsed(`section:${id}`, !next);
  }

  return (
    <div ref={sectionRef} id={id} className="space-y-3">
      <div
        style={{ top: "var(--fixed-header-h, 0px)" }}
        className="sticky z-30 -mx-4 relative"
      >
        <button
          onClick={toggle}
          className="flex w-full min-h-11 items-center gap-1.5 bg-background px-4 text-left text-sm font-medium uppercase tracking-wide active:opacity-70 transition-opacity"
        >
          <span className="text-muted-foreground">{label}</span>
          {mounted && open ? (
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          )}
        </button>
        {/* Fade below the sticky row — mirrors the main FixedHeader gradient.
            Absolutely positioned so it overlays content and doesn't add layout height. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full h-6 bg-gradient-to-b from-background to-transparent"
        />
      </div>
      {mounted && open && children}
    </div>
  );
}
