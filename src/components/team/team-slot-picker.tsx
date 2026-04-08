"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { MetaPokemon } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-green-500",
  Ice: "bg-cyan-500",
  Fighting: "bg-red-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-600",
  Flying: "bg-indigo-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-amber-700",
  Ghost: "bg-purple-700",
  Dragon: "bg-indigo-600",
  Dark: "bg-stone-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-400",
};

export function TeamSlotPicker({
  open,
  onOpenChange,
  onSelect,
  excludeIds,
  leagueMeta,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pokemonId: string) => void;
  excludeIds: string[];
  leagueMeta?: MetaPokemon[];
}) {
  const [query, setQuery] = useState("");

  // Filter meta picks to exclude already-selected Pokemon
  const metaPicks = useMemo(() => {
    if (!leagueMeta) return [];
    return leagueMeta
      .filter((m) => !excludeIds.includes(m.pokemonId))
      .slice(0, 12);
  }, [leagueMeta, excludeIds]);

  // Search results from full pokemon list
  const results = useMemo(() => {
    if (query.length < 2) return [];
    const lower = query.toLowerCase();
    return pokemonData
      .filter(
        (p) =>
          !excludeIds.includes(p.id) &&
          (p.name.toLowerCase().includes(lower) || p.id.includes(lower)),
      )
      .slice(0, 12);
  }, [query, excludeIds]);

  function handleSelect(pokemonId: string) {
    onSelect(pokemonId);
    setQuery("");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Add Pokemon</SheetTitle>
          <SheetDescription>
            Pick a meta Pokemon or search below.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Meta picks as tappable chips */}
          {metaPicks.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Meta Picks
              </p>
              <div className="flex flex-wrap gap-2">
                {metaPicks.map((m) => {
                  const pokemon = pokemonData.find((p) => p.id === m.pokemonId);
                  const primaryType = pokemon?.types[0];
                  return (
                    <button
                      key={m.pokemonId}
                      onClick={() => handleSelect(m.pokemonId)}
                      className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-opacity active:opacity-70 ${
                        primaryType
                          ? TYPE_COLORS[primaryType] ?? "bg-gray-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {pokemon?.name ?? m.pokemonId.replace(/-/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search input */}
          <Input
            type="text"
            placeholder="Search Pokemon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-11 text-base"
            autoComplete="off"
            autoFocus={false}
          />

          {/* Search results */}
          {results.length > 0 && (
            <ul className="mt-2 space-y-1">
              {results.map((pokemon) => (
                <li key={pokemon.id}>
                  <button
                    onClick={() => handleSelect(pokemon.id)}
                    className="flex w-full min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                  >
                    <span className="flex-1 text-sm font-medium capitalize">
                      {pokemon.name}
                    </span>
                    <div className="flex gap-1">
                      {pokemon.types.map((t) => (
                        <span
                          key={t}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[t] ?? "bg-gray-500"}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.length >= 2 && results.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No Pokemon found for &quot;{query}&quot;
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
