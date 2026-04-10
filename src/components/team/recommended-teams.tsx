"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { RecommendedTeam, StrategyTip } from "@/lib/team-advisor";
import { RATING_COLORS } from "@/lib/team-rating";
import { getPokemonName } from "@/lib/pokemon-utils";
import { getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import type { MetaPokemon } from "@/lib/types";
import type { LeagueId } from "@/data/leagues";

type RecommendedTeamsProps = {
  teams: RecommendedTeam[];
  leagueId: LeagueId;
  onUseTeam: (pokemonIds: [string, string, string]) => void;
};

const ROLE_LABELS: Record<string, string> = {
  lead: "LEAD",
  "safe-swap": "SAFE SWAP",
  closer: "CLOSER",
};

function getMoveset(pokemonId: string, leagueId: LeagueId): string {
  const league = getLeagueInfo(leagueId);
  const meta = (league.meta as MetaPokemon[]).find(
    (m) => m.pokemonId === pokemonId,
  );
  if (meta)
    return `${meta.recommendedFast} | ${meta.recommendedCharged.join(", ")}`;
  const p = getPokemonById(pokemonId);
  if (!p) return "";
  return `${p.fastMoves[0]?.name ?? ""} | ${p.chargedMoves
    .slice(0, 2)
    .map((m) => m.name)
    .join(", ")}`;
}

export function RecommendedTeams({
  teams,
  leagueId,
  onUseTeam,
  defaultOpen = true,
}: RecommendedTeamsProps & { defaultOpen?: boolean }) {
  const [sectionOpen, setSectionOpen] = useState(defaultOpen);
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (teams.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        className="flex w-full items-center gap-1 py-2 text-sm font-semibold active:opacity-70"
      >
        {sectionOpen ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
        Recommended Teams ({teams.length})
      </button>

      {!sectionOpen ? null : teams.map((team, index) => {
        const isExpanded = expandedIndex === index;
        const ratingClasses = RATING_COLORS[team.rating];

        if (!isExpanded) {
          return (
            <button
              key={index}
              onClick={() => setExpandedIndex(index)}
              className="flex w-full items-center gap-2 rounded-lg border bg-card p-3 text-left active:opacity-70"
            >
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm font-medium">
                {team.pokemonIds.map((id) => getPokemonName(id)).join(" \u00B7 ")}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ratingClasses}`}
              >
                {team.rating}
              </span>
            </button>
          );
        }

        return (
          <div
            key={index}
            className="rounded-lg border bg-card p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedIndex(-1)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground active:opacity-70"
              >
                <ChevronDown className="h-4 w-4" />
                {team.coverageScore}/18 types covered
              </button>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ratingClasses}`}
              >
                {team.rating}
              </span>
            </div>

            {/* Roles */}
            <div className="mt-4 space-y-3">
              {team.roles.map((role) => (
                <div key={role.pokemonId}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {ROLE_LABELS[role.role] ?? role.role}
                  </p>
                  <p className="font-semibold">
                    {getPokemonName(role.pokemonId)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getMoveset(role.pokemonId, leagueId)}
                  </p>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            {/* Strategy */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Strategy</p>
              {team.tips.map((tip: StrategyTip, i: number) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {tip.tip}
                </p>
              ))}
            </div>

            {/* Use This Team button */}
            <button
              onClick={() => onUseTeam(team.pokemonIds)}
              className="mt-4 w-full min-h-11 rounded-lg px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground transition-all active:scale-[0.98]"
            >
              Use This Team
            </button>
          </div>
        );
      })}
    </div>
  );
}
