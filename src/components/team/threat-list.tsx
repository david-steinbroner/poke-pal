"use client";

import type { PokemonType } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/constants";

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
