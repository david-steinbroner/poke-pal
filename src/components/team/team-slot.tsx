"use client";

import type { PokemonType } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { TYPE_COLORS } from "@/lib/constants";

type TeamSlot = {
  pokemonId: string;
  name: string;
  types: PokemonType[];
  fastMoves: { name: string; type: PokemonType }[];
  chargedMoves: { name: string; type: PokemonType }[];
} | null;

export function TeamSlotCard({
  slot,
  onAdd,
  onRemove,
  label,
}: {
  slot: TeamSlot;
  onAdd: () => void;
  onRemove: () => void;
  label: string;
}) {
  if (!slot) {
    return (
      <button
        onClick={onAdd}
        className="flex min-h-20 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-3 text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <Plus className="h-5 w-5" />
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs">Tap to add</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="mt-0.5 block font-medium text-sm capitalize text-left"
        >
          {slot.name}
        </button>
        <div className="mt-1 flex gap-1">
          {slot.types.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[t] ?? "bg-gray-500"}`}
            >
              {t}
            </span>
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
