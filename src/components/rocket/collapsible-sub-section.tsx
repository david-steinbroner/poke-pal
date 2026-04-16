"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

type CollapsibleSubSectionProps = {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSubSection({
  label,
  defaultOpen = false,
  children,
}: CollapsibleSubSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 py-1.5 active:opacity-70 transition-opacity"
      >
        {open ? (
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </button>
      {open && <div className="space-y-1.5 pt-1">{children}</div>}
    </div>
  );
}
