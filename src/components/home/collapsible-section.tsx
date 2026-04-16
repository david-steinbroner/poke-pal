"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { isCollapsed, setCollapsed } from "@/lib/home-collapse-storage";

type CollapsibleSectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  forceOpen?: boolean;
};

export function CollapsibleSection({
  id,
  label,
  children,
  forceOpen,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  // Hydrate collapsed state from localStorage on mount (intentional SSR pattern)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const raw = window.location.hash.replace("#", "");
    if (!raw || !/^[a-z0-9-]+$/.test(raw)) {
      setOpen(forceOpen === true || !isCollapsed(`section:${id}`));
      setMounted(true);
      return;
    }
    if (raw === id) {
      setOpen(true);
      setCollapsed(`section:${id}`, false);
      scrolledRef.current = false;
    } else {
      setOpen(!isCollapsed(`section:${id}`));
    }
    setMounted(true);
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted || scrolledRef.current) return;
    const raw = window.location.hash.replace("#", "");
    if (raw !== id || !open) return;
    scrolledRef.current = true;
    requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (!el) return;
      const headerH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--fixed-header-h") || "72"
      );
      window.scrollTo({
        top: el.offsetTop - headerH - 8,
        behavior: "smooth",
      });
    });
  }, [mounted, open, id]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setCollapsed(`section:${id}`, !next);
  }

  return (
    <div ref={sectionRef} id={id} className="scroll-mt-[var(--fixed-header-h,72px)] space-y-3">
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
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full h-6 bg-gradient-to-b from-background to-transparent"
        />
      </div>
      {mounted && open && children}
    </div>
  );
}
