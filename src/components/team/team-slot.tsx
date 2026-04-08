"use client";

import { X } from "lucide-react";
import { TypeBadge } from "@/components/type-badge";
import type { TeamSlot } from "@/lib/team-types";
import type { ReactNode } from "react";

export function TeamSlotCard({
  slot,
  onRemove,
  label,
  children,
}: {
  slot: TeamSlot;
  onRemove: () => void;
  label: string;
  children?: ReactNode;
}) {
  if (!slot) {
    return (
      <div className="rounded-lg border border-dashed p-3">
        <p className="text-center text-xs text-muted-foreground">{label}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <p className="mt-0.5 font-medium text-sm">{slot.name}</p>
        <div className="mt-1 flex gap-1">
          {slot.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${slot.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
