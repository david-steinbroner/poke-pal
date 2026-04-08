"use client";

import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeaguePicker } from "@/components/team/league-picker";
import { TeamSlotCard } from "@/components/team/team-slot";
import { TeamSlotPicker } from "@/components/team/team-slot-picker";
import { CoverageChart } from "@/components/team/coverage-chart";
import { ThreatList } from "@/components/team/threat-list";
import { SwapSuggestions } from "@/components/team/swap-suggestions";
import { CopyBar } from "@/components/copy-bar";
import { analyzeTeam, getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import type { LeagueId, TeamSlot } from "@/lib/team-types";
import type { MetaPokemon, PokemonType } from "@/lib/types";
import Link from "next/link";

export default function TeamsPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
      <TeamsPage />
    </Suspense>
  );
}

const SLOT_LABELS = ["Lead", "Mid", "Closer"] as const;

function pokemonToSlot(id: string): TeamSlot {
  const p = getPokemonById(id);
  if (!p) return null;
  return {
    pokemonId: p.id,
    name: p.name,
    types: p.types as PokemonType[],
    fastMoves: p.fastMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
    chargedMoves: p.chargedMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
  };
}

function TeamsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL params
  const initialLeague = (searchParams.get("l") as LeagueId) || "great-league";
  const initialPokemon = searchParams.get("p")?.split(",").filter(Boolean) || [];

  const [league, setLeague] = useState<LeagueId>(initialLeague);
  const [team, setTeam] = useState<[TeamSlot, TeamSlot, TeamSlot]>(() => [
    initialPokemon[0] ? pokemonToSlot(initialPokemon[0]) : null,
    initialPokemon[1] ? pokemonToSlot(initialPokemon[1]) : null,
    initialPokemon[2] ? pokemonToSlot(initialPokemon[2]) : null,
  ]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);

  // Sync state to URL
  useEffect(() => {
    const pokemonIds = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => s.pokemonId);
    const params = new URLSearchParams();
    params.set("l", league);
    if (pokemonIds.length > 0) {
      params.set("p", pokemonIds.join(","));
    }
    const url = `/teams?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [team, league, router]);

  const leagueInfo = useMemo(() => getLeagueInfo(league), [league]);

  const analysis = useMemo(
    () => analyzeTeam(team, league),
    [team, league],
  );

  const excludeIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  const handleLeagueChange = useCallback(
    (newLeague: LeagueId) => {
      setLeague(newLeague);
      // Clear team if switching to a league with type restrictions
      const info = getLeagueInfo(newLeague);
      if (info.typeRestrictions) {
        setTeam((prev) =>
          prev.map((slot) => {
            if (!slot) return null;
            const hasValidType = slot.types.some((t) =>
              info.typeRestrictions!.includes(t),
            );
            return hasValidType ? slot : null;
          }) as [TeamSlot, TeamSlot, TeamSlot],
        );
      }
    },
    [],
  );

  function handleSlotAdd(index: 0 | 1 | 2) {
    setActiveSlot(index);
    setPickerOpen(true);
  }

  function handleSlotRemove(index: 0 | 1 | 2) {
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[index] = null;
      return next;
    });
  }

  function handlePokemonSelect(pokemonId: string) {
    const slot = pokemonToSlot(pokemonId);
    if (!slot) return;
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[activeSlot] = slot;
      return next;
    });
    setPickerOpen(false);
  }

  function handleSuggestionSelect(pokemonId: string) {
    // Find first empty slot, or replace last slot
    const emptyIndex = team.findIndex((s) => s === null);
    const targetIndex = emptyIndex >= 0 ? emptyIndex : 2;
    const slot = pokemonToSlot(pokemonId);
    if (!slot) return;
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[targetIndex] = slot;
      return next;
    });
  }

  const hasTeam = team.some((s) => s !== null);

  return (
    <div className="space-y-5 pt-4 pb-8">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-bold">Team Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a team, check coverage, copy the search string.
        </p>
      </div>

      <LeaguePicker selected={league} onSelect={handleLeagueChange} />

      <div className="space-y-2">
        {SLOT_LABELS.map((label, i) => (
          <TeamSlotCard
            key={label}
            slot={team[i] ?? null}
            label={label}
            onAdd={() => handleSlotAdd(i as 0 | 1 | 2)}
            onRemove={() => handleSlotRemove(i as 0 | 1 | 2)}
          />
        ))}
      </div>

      <TeamSlotPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePokemonSelect}
        excludeIds={excludeIds}
        leagueMeta={leagueInfo.meta as MetaPokemon[]}
      />

      {hasTeam && (
        <>
          {analysis.searchString && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Find your team in-game
              </p>
              <CopyBar searchString={analysis.searchString} />
            </div>
          )}

          <CoverageChart
            offensiveCoverage={analysis.offensiveCoverage}
            defensiveWeaknesses={analysis.defensiveWeaknesses}
          />

          {analysis.threats.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium">
                Meta Threats
              </h2>
              <ThreatList threats={analysis.threats} />
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium">
                Suggestions
              </h2>
              <SwapSuggestions
                suggestions={analysis.suggestions}
                onSelect={handleSuggestionSelect}
              />
            </div>
          )}

          {/* Cross-links to counter pages */}
          <div>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Counter Details
            </h2>
            <div className="flex flex-wrap gap-2">
              {team
                .filter((s): s is NonNullable<TeamSlot> => s !== null)
                .map((s) => (
                  <Link
                    key={s.pokemonId}
                    href={`/counter/${s.pokemonId}`}
                    className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
                  >
                    {s.name} counters
                  </Link>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
