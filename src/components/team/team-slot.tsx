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
        {children && <div>{children}</div>}
        {!children && (
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3">
      {/* Top row: name + X right-aligned */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">{slot.name}</span>
        <button
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Remove ${slot.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Bottom row: moveset — full width */}
      {moveset && (
        <p className="mt-0.5 text-sm text-muted-foreground">{moveset}</p>
      )}
    </div>
  );
}
