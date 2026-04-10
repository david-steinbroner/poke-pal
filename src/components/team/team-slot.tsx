"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import type { TeamSlot } from "@/lib/team-types";
import type { ReactNode } from "react";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "size-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function TeamSlotCard({
  slot,
  onRemove,
  label,
  moveset,
  role,
  onCopyHint,
  children,
}: {
  slot: TeamSlot;
  onRemove: () => void;
  label: string;
  moveset?: string;
  role?: string;
  onCopyHint?: () => void;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!onCopyHint) return;
    onCopyHint();
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopyHint]);

  if (!slot) {
    return (
      <div className="rounded-lg border border-dashed p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {onCopyHint && (
            <button
              onClick={handleCopy}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                copied
                  ? "text-green-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-label="Copy coverage search string"
            >
              {copied ? (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <CopyIcon />
              )}
            </button>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3">
      {role && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {role}
        </p>
      )}
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
