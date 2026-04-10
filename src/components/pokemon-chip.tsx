"use client";

import { X, Plus, Check } from "lucide-react";

export function PokemonChip({
  name,
  onAction,
  variant = "remove",
}: {
  name: string;
  onAction?: () => void;
  variant?: "remove" | "add" | "added";
}) {
  const Icon = variant === "add" ? Plus : variant === "added" ? Check : X;
  const isDisabled = variant === "added";

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
