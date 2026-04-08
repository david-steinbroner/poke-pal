"use client";

import { X, Plus } from "lucide-react";

export function PokemonChip({
  name,
  onAction,
  variant = "remove",
}: {
  name: string;
  onAction?: () => void;
  variant?: "remove" | "add";
}) {
  const Icon = variant === "add" ? Plus : X;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium">
      <span className="max-w-[120px] truncate">{name}</span>
      {onAction && (
        <button
          onClick={onAction}
          className="ml-0.5 -mr-1 p-1 text-muted-foreground hover:text-foreground"
          aria-label={`${variant === "add" ? "Add" : "Remove"} ${name}`}
        >
          <Icon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
