"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeaguePicker } from "@/components/team/league-picker";
import { TeamSlotCard } from "@/components/team/team-slot";
import { CoverageChart } from "@/components/team/coverage-chart";
import { ThreatList } from "@/components/team/threat-list";
import { SwapSuggestions } from "@/components/team/swap-suggestions";
import { CopyButton } from "@/components/copy-button";
import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { ClearButton } from "@/components/clear-button";
import { analyzeTeam, assignRoles, getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";
import { loadTeam, saveTeam, clearTeam } from "@/lib/team-storage";
import { calculateTeamRating, RATING_COLORS } from "@/lib/team-rating";
import { getGapTypes } from "@/lib/team-rating";
import { buildAbsoluteTeamUrl } from "@/lib/team-urls";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import type { LeagueId, TeamSlot, RoleAssignment } from "@/lib/team-types";
import type { MetaPokemon, PokemonType } from "@/lib/types";

export default function TeamsPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
      <TeamsPage />
    </Suspense>
  );
}

const SLOT_LABELS = ["Pokemon 1", "Pokemon 2", "Pokemon 3"] as const;


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
  // Mount-only: load from URL or localStorage ONCE
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (initialPokemon.length === 0 && team.every((s) => s === null)) {
      const stored = loadTeam(league);
      if (stored.length > 0) {
        setTeam([
          stored[0] ? pokemonToSlot(stored[0]) : null,
          stored[1] ? pokemonToSlot(stored[1]) : null,
          stored[2] ? pokemonToSlot(stored[2]) : null,
        ] as [TeamSlot, TeamSlot, TeamSlot]);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist team to localStorage whenever it changes
  useEffect(() => {
    const ids = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => s.pokemonId);
    saveTeam(league, ids);
  }, [team, league]);

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

  // Compute role assignments when 2+ Pokemon are on the team
  const roles = useMemo(() => {
    const filledCount = team.filter((s) => s !== null).length;
    if (filledCount < 2) return [];
    return assignRoles(team, league);
  }, [team, league]);

  // Build a lookup: pokemonId -> RoleAssignment
  const roleMap = useMemo(() => {
    const map = new Map<string, RoleAssignment>();
    for (const r of roles) map.set(r.pokemonId, r);
    return map;
  }, [roles]);

  const excludeIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  const handleLeagueChange = useCallback(
    (newLeague: LeagueId) => {
      // 1. Save current team under current league
      const currentIds = team
        .filter((s): s is NonNullable<TeamSlot> => s !== null)
        .map((s) => s.pokemonId);
      saveTeam(league, currentIds);

      // 2. Clear all slots
      setTeam([null, null, null]);

      // 3. Switch league (do NOT load from localStorage for the new league)
      setLeague(newLeague);
    },
    [team, league],
  );

  function handleSlotRemove(index: 0 | 1 | 2) {
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[index] = null;
      return next;
    });
  }

  function handlePokemonSelect(pokemonId: string) {
    // Skip if already on the team
    if (excludeIds.includes(pokemonId)) return;
    const slot = pokemonToSlot(pokemonId);
    if (!slot) return;
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      const emptyIndex = next.findIndex((s) => s === null);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : 2; // replace last if full
      next[targetIndex] = slot;
      return next;
    });
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

  function handleClear() {
    setTeam([null, null, null]);
    clearTeam(league);
  }

  const hasTeam = team.some((s) => s !== null);

  const pokemonIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  const teamRating = useMemo(
    () => (pokemonIds.length > 0 ? calculateTeamRating(pokemonIds, league) : null),
    [pokemonIds, league],
  );

  // Meta suggestions filtered to exclude already-selected Pokemon
  const metaSuggestions = useMemo(
    () => (leagueInfo.meta as MetaPokemon[]).filter((m) => !excludeIds.includes(m.pokemonId)),
    [leagueInfo.meta, excludeIds],
  );

  // Types that would fill the team's offensive gaps
  const gapTypes = useMemo(
    () => (hasTeam ? getGapTypes(analysis.offensiveCoverage) : []),
    [hasTeam, analysis.offensiveCoverage],
  );

  const handleShare = useCallback(async () => {
    if (pokemonIds.length === 0) return;
    const url = buildAbsoluteTeamUrl(league, pokemonIds);
    const success = await copyToClipboard(url);
    if (success) {
      toast("Link copied!");
    } else {
      toast("Could not copy link");
    }
  }, [league, pokemonIds]);

  return (
    <div className="space-y-5 pt-4 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Team Builder</h1>
          {teamRating && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${RATING_COLORS[teamRating]}`}>
              {teamRating}
            </span>
          )}
          {hasTeam && <ClearButton onClick={handleClear} />}
        </div>
      </div>

      <SearchInput mode="select" onSelect={handlePokemonSelect} placeholder="Add a Pokemon..." />

      {/* Copy + Share row — always visible, greyed out until conditions met */}
      <div className="flex gap-2">
        <div className="flex-1">
          {hasTeam && analysis.searchString ? (
            <CopyButton searchString={analysis.searchString} label="Copy Search String" compact />
          ) : (
            <button
              disabled
              className="w-full min-h-11 rounded-lg px-4 py-3 text-sm font-semibold bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
            >
              Copy Search String
            </button>
          )}
        </div>
        <div className="flex-1">
          <button
            onClick={pokemonIds.length >= 3 ? handleShare : undefined}
            disabled={pokemonIds.length < 3}
            className={`w-full min-h-11 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
              pokemonIds.length >= 3
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground/40 border-border/40 cursor-not-allowed"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Team slots with inline suggestions on next empty slot */}
      <div className="space-y-2">
        {SLOT_LABELS.map((label, i) => {
          const slot = team[i] ?? null;
          const isEmpty = slot === null;
          // Only show suggestions in the NEXT slot to fill:
          // Slot 0 always shows if empty, slot 1 only if slot 0 is filled, slot 2 only if 0+1 filled
          const showSuggestions = isEmpty && team.slice(0, i).every((s) => s !== null);
          return (
            <div key={label}>
              <TeamSlotCard
                slot={slot}
                label={label}
                onRemove={() => handleSlotRemove(i as 0 | 1 | 2)}
              >
                {showSuggestions && metaSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {metaSuggestions.slice(0, 5).map((m) => {
                        const p = getPokemonById(m.pokemonId);
                        return (
                          <PokemonChip
                            key={m.pokemonId}
                            name={p?.name ?? m.pokemonId}
                            variant="add"
                            onAction={() => handlePokemonSelect(m.pokemonId)}
                          />
                        );
                      })}
                    </div>
                    {gapTypes.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        or any {gapTypes.join(", ")} type
                      </p>
                    )}
                  </div>
                )}
              </TeamSlotCard>
            </div>
          );
        })}
      </div>

      <LeaguePicker selected={league} onSelect={handleLeagueChange} />

      {hasTeam && (
        <>
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
        </>
      )}
    </div>
  );
}
