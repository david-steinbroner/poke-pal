"use client";

import type { PokemonType } from "@/lib/types";

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

type TeamThreat = {
  pokemonId: string;
  name: string;
  threatTypes: PokemonType[];
  threatenedMembers: string[];
};

export function ThreatList({ threats }: { threats: TeamThreat[] }) {
  if (threats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No major threats detected. Nice team!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {threats.map((threat) => (
        <div
          key={threat.pokemonId}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm capitalize">
              {threat.name}
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {threat.threatTypes.map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[t] ?? "bg-gray-500"}`}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Threatens{" "}
              {threat.threatenedMembers
                .map((m) => m.replace(/-/g, " "))
                .join(", ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
