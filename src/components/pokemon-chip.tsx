"use client";

import { X } from "lucide-react";

export function PokemonChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium">
      <span className="max-w-[120px] truncate">{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-1 p-1 text-muted-foreground hover:text-foreground"
          style={{ touchAction: "manipulation" }}
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
