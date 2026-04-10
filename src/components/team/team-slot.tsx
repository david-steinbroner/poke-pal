"use client";

import { X } from "lucide-react";
import type { TeamSlot } from "@/lib/team-types";
import type { ReactNode } from "react";

export function TeamSlotCard({
  slot,
  onRemove,
  label,
  moveset,
  children,
}: {
  slot: TeamSlot;
  onRemove: () => void;
  label: string;
  moveset?: string;
  children?: ReactNode;
}) {
  if (!slot) {
    return (
      <div className="rounded-lg border border-dashed p-3">
        <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {children && <div className="mt-2">{children}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <p className="mt-0.5 font-semibold text-base">{slot.name}</p>
        {moveset && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{moveset}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${slot.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
