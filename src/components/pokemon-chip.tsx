"use client";

import { X, Plus, Check } from "lucide-react";

export function PokemonChip({
  name,
  onAction,
  onSecondaryAction,
  variant = "remove",
}: {
  name: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  variant?: "remove" | "add" | "added" | "pool";
}) {
  const isDisabled = variant === "added";
  const isPool = variant === "pool";

  if (isPool) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-1.5 text-sm font-medium">
        <button
          onClick={onAction}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label={`Add ${name} to team`}
        >
          <Plus className="h-3 w-3" />
        </button>
        <span className="max-w-[120px] truncate">{name}</span>
        <button
          onClick={onSecondaryAction}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label={`Remove ${name} from pool`}
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    );
  }

  const Icon = variant === "add" ? Plus : variant === "added" ? Check : X;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium ${isDisabled ? "opacity-60" : ""}`}>
      <span className="max-w-[120px] truncate">{name}</span>
      {(onAction || isDisabled) && (
        <button
          onClick={isDisabled ? undefined : onAction}
          className={`ml-0.5 -mr-1 p-1 ${isDisabled ? "text-green-600 pointer-events-none" : "text-muted-foreground hover:text-foreground"}`}
          aria-label={`${variant === "add" ? "Add" : variant === "added" ? "Added" : "Remove"} ${name}`}
          aria-disabled={isDisabled}
        >
          <Icon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
