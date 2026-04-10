"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { isCollapsed, setCollapsed } from "@/lib/home-collapse-storage";

type CollapsibleSectionProps = {
  id: string;
  label: string;
  prefix?: string;
  accentColor?: string;
  children: React.ReactNode;
};

export function CollapsibleSection({
  id,
  label,
  prefix = "LIVE:",
  accentColor = "text-green-600",
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOpen(!isCollapsed(`section:${id}`));
    setMounted(true);
  }, [id]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setCollapsed(`section:${id}`, !next);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={toggle}
        className="flex min-h-11 items-center gap-1 text-[13px] font-medium uppercase tracking-wide active:opacity-70 transition-opacity"
      >
        <span className={accentColor}>{prefix}</span>
        <span className="text-muted-foreground">{label}</span>
        {mounted && open ? (
          <ChevronDownIcon className="ml-1 size-4 text-muted-foreground" />
        ) : (
          <ChevronUpIcon className="ml-1 size-4 text-muted-foreground" />
        )}
      </button>
      {mounted && open && children}
    </div>
  );
}
