"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LEAGUE_IDS, LEAGUE_SHORT_NAMES, SCAN_API_URL } from "@/lib/constants";
import { TeamSlotCard } from "@/components/team/team-slot";
import { ThreatList } from "@/components/team/threat-list";
import { FixedHeader } from "@/components/fixed-header";
import { PokemonPool } from "@/components/team/pokemon-pool";
import { RecommendedTeams } from "@/components/team/recommended-teams";
import { analyzeTeam, assignRoles, getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import { calculateTeamRating, RATING_COLORS, RATING_LABELS } from "@/lib/team-rating";
import { pokemonToSlot, matchPokemonNames } from "@/lib/pokemon-utils";
import {
  loadTeam,
  saveTeam,
  loadAdvisorState,
  addToPool,
  removeFromPool,
  setCpCopied,
} from "@/lib/team-storage";
import { recommendTeams } from "@/lib/team-advisor";
import { generateStrategyTips } from "@/lib/team-advisor";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { buildLeagueEligibleString } from "@/lib/search-string";
import { getEffectiveness } from "@/lib/type-effectiveness";
import { PokemonChip } from "@/components/pokemon-chip";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import type { LeagueId, TeamSlot } from "@/lib/team-types";
import { POKEMON_TYPES, type PokemonType, type MetaPokemon } from "@/lib/types";

export default function TeamsPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
      <TeamsPage />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible sections                                               */
/* ------------------------------------------------------------------ */

function CopyIconButton({
  label,
  searchString,
  onCopy,
  disabled,
}: {
  label: string;
  searchString: string;
  onCopy?: () => void;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(async () => {
    if (disabled) return;
    await copyToClipboard(searchString);
    if (onCopy) onCopy();
    setCopied(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setCopied(false), 3000);
  }, [searchString, onCopy, disabled]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
        copied
          ? "bg-green-600 text-white"
          : disabled
            ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
            : "bg-primary text-primary-foreground"
      }`}
    >
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {copied ? "Copied!" : label}
    </button>
  );
}

function MetaThreatsSection({ threats }: { threats: Parameters<typeof ThreatList>[0]["threats"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium active:opacity-70"
      >
        <span>Meta Threats ({threats.length})</span>
        {open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && <ThreatList threats={threats} />}
    </div>
  );
}

function MyTeamSection({
  team,
  getRoleLabel,
  getMoveset,
  onSlotRemove,
  onAddToTeam,
  tips,
  gapTypes,
  weaknesses,
  cpCap,
  rating,
  ratingLabel,
  coverageScore,
  suggestedPoolPokemon,
}: {
  team: [TeamSlot, TeamSlot, TeamSlot];
  getRoleLabel: (pokemonId: string) => string | undefined;
  getMoveset: (pokemonId: string) => string | undefined;
  onSlotRemove: (index: 0 | 1 | 2) => void;
  onAddToTeam: (pokemonId: string) => void;
  tips: { role: string; pokemonName: string; tip: string }[];
  gapTypes: string[];
  weaknesses: { type: string; members: string[] }[];
  cpCap: number;
  rating?: string | null;
  ratingLabel?: string | null;
  coverageScore?: number;
  suggestedPoolPokemon: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(true);
  const filledCount = team.filter((s) => s !== null).length;
  const isFullTeamLocal = filledCount === 3;

  function getEmptySlotLabel(): string {
    if (filledCount === 0) return "Add a Pokemon";
    if (gapTypes.length > 0) {
      return `Needs ${gapTypes.slice(0, 3).join(", ")} coverage`;
    }
    return "Add a Pokemon";
  }

  function handleCopyGapString() {
    if (gapTypes.length === 0) return;
    // For each gap type (e.g. Electric), find move types that beat it (e.g. Ground)
    const counterTypes = new Set<string>();
    for (const gapType of gapTypes.slice(0, 4)) {
      for (const atkType of POKEMON_TYPES) {
        if (getEffectiveness(atkType, [gapType as PokemonType]) > 1.0) {
          counterTypes.add(atkType.toLowerCase());
        }
      }
    }
    // Build search: move types that counter the gaps, within CP cap, exclude team members
    const typeFilters = [...counterTypes].slice(0, 4).map((t) => `@1${t}`).join(",");
    const cpPart = cpCap >= 9999 ? "cp2500-" : `cp-${cpCap}`;
    const teamNames = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => `!${s.name.toLowerCase()}`);
    const excludePart = teamNames.length > 0 ? `&${teamNames.join("&")}` : "";
    copyToClipboard(`${typeFilters}&${cpPart}${excludePart}`);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 py-2 text-sm font-semibold active:opacity-70"
      >
        {open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
        My Team ({filledCount})
      </button>
      {open && (
        <div className="space-y-3">
          {/* Team slots */}
          <div className="space-y-2">
            {(() => {
              let nextEmptyFound = false;
              return ([0, 1, 2] as const).map((i) => {
                const slot = team[i] ?? null;
                const roleLabel = slot ? getRoleLabel(slot.pokemonId) : undefined;

                // Only the NEXT empty slot gets hints — not all empty slots
                const isNextEmpty = !slot && !nextEmptyFound && filledCount > 0;
                if (isNextEmpty) nextEmptyFound = true;
                const isLaterEmpty = !slot && !isNextEmpty && filledCount > 0;

                // Next empty slot: gap hints + copy + suggestions
                // Later empty slots: tell user to fill the previous one first
                let label = "";
                if (slot) {
                  label = "";
                } else if (isNextEmpty && gapTypes.length > 0) {
                  label = `Can't beat ${gapTypes.slice(0, 3).join(", ")} types yet`;
                } else if (isNextEmpty) {
                  label = "Add a Pokemon";
                } else if (isLaterEmpty) {
                  label = "Add a 2nd Pokemon first";
                } else {
                  label = "Add a Pokemon";
                }

                return (
                  <div key={i}>
                    <TeamSlotCard
                      slot={slot}
                      label={label}
                      onRemove={() => onSlotRemove(i)}
                      moveset={slot ? getMoveset(slot.pokemonId) : undefined}
                      role={roleLabel}
                      onCopyHint={isNextEmpty && gapTypes.length > 0 ? handleCopyGapString : undefined}
                    >
                      {isNextEmpty && suggestedPoolPokemon.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {suggestedPoolPokemon.slice(0, 3).map((p) => (
                            <PokemonChip
                              key={p.id}
                              name={p.name}
                              variant="add"
                              onAction={() => onAddToTeam(p.id)}
                            />
                          ))}
                        </div>
                      )}
                    </TeamSlotCard>
                  </div>
                );
              });
            })()}
          </div>

          {/* Analysis — only with full team */}
          {isFullTeamLocal && rating && ratingLabel && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">Analysis</p>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ${
                  RATING_COLORS[rating as keyof typeof RATING_COLORS] ?? "text-muted-foreground bg-muted"
                }`}>
                  {rating}
                </span>
                <span className="text-sm text-muted-foreground">{ratingLabel}</span>
              </div>
              {coverageScore != null && (
                <p className="text-sm text-muted-foreground">
                  Covers {coverageScore}/18 types
                  {gapTypes.length > 0 && ` · Can't beat ${gapTypes.join(", ")}`}
                </p>
              )}
              {weaknesses.length > 0 && (
                <div className="space-y-0.5">
                  {weaknesses.map((w) => (
                    <p key={w.type} className="text-sm text-muted-foreground">
                      Weak to {w.type}: {w.members.join(", ")}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Strategy — only with full team */}
          {isFullTeamLocal && tips.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Strategy</p>
              {tips.map((tip) => (
                <div key={tip.pokemonName} className="text-sm">
                  <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
                    {tip.role}
                  </span>
                  <p>
                    <span className="font-medium">{tip.pokemonName}</span>
                    {" — "}
                    <span className="text-muted-foreground">{tip.tip}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

function TeamsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL params first, localStorage on mount
  const urlLeague = searchParams.get("l") as LeagueId | null;
  const initialPokemon = searchParams.get("p")?.split(",").filter(Boolean) || [];

  const [league, setLeague] = useState<LeagueId>(urlLeague || LEAGUE_IDS[0]);
  const [mounted, setMounted] = useState(false);
  const [team, setTeam] = useState<[TeamSlot, TeamSlot, TeamSlot]>(() => [
    initialPokemon[0] ? pokemonToSlot(initialPokemon[0]) : null,
    initialPokemon[1] ? pokemonToSlot(initialPokemon[1]) : null,
    initialPokemon[2] ? pokemonToSlot(initialPokemon[2]) : null,
  ]);

  // Advisor state: pool + cpCopied
  const [pool, setPool] = useState<string[]>([]);
  const [cpCopied, setCpCopiedState] = useState(false);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Mount-only: load from URL or localStorage ONCE
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);

    // Load last edited league from localStorage if no URL param
    let activeLeague = league;
    if (!urlLeague) {
      try {
        const last = localStorage.getItem("poke-pal:lastEditedLeague");
        if (last && (LEAGUE_IDS as readonly string[]).includes(last)) {
          activeLeague = last as LeagueId;
          setLeague(activeLeague);
        }
      } catch { /* ignore */ }
    }

    // Load team from localStorage if no URL params
    if (initialPokemon.length === 0) {
      const stored = loadTeam(activeLeague);
      if (stored.length > 0) {
        setTeam([
          stored[0] ? pokemonToSlot(stored[0]) : null,
          stored[1] ? pokemonToSlot(stored[1]) : null,
          stored[2] ? pokemonToSlot(stored[2]) : null,
        ] as [TeamSlot, TeamSlot, TeamSlot]);
      }
    }

    // Load advisor state (pool + cpCopied) from localStorage
    // If pool is empty, cpCopied is meaningless — reset to State 1
    const advisorState = loadAdvisorState(activeLeague);
    setPool(advisorState.pool);
    setCpCopiedState(advisorState.pool.length > 0 ? advisorState.cpCopied : false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist team + last edited league to localStorage whenever it changes
  useEffect(() => {
    const ids = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => s.pokemonId);
    saveTeam(league, ids);
    try { localStorage.setItem("poke-pal:lastEditedLeague", league); } catch { /* ignore */ }
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

  /* ---------- Derived state ---------- */

  const leagueInfo = useMemo(() => getLeagueInfo(league), [league]);

  const analysis = useMemo(
    () => analyzeTeam(team, league),
    [team, league],
  );

  const hasTeam = team.some((s) => s !== null);
  const hasPool = pool.length > 0;

  // Derive the 4 states from data
  // State 4: team loaded
  // State 3: pool >= 3 and no team (recommendations available)
  // State 2: cpCopied/skipped AND building pool (upload/search active)
  // State 1: fresh — show CP copy button
  // Key rule: removing all Pokemon resets to State 1
  const state: 1 | 2 | 3 | 4 = hasTeam
    ? 4
    : pool.length >= 3
      ? 3
      : (cpCopied && !hasTeam) || hasPool
        ? 2
        : 1;

  const excludeIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  // Recommendations (computed from pool)
  const recommendations = useMemo(
    () => (pool.length >= 3 ? recommendTeams(pool, league) : []),
    [pool, league],
  );

  // Roles for the current team (State 4)
  const roles = useMemo(
    () => (hasTeam ? assignRoles(team, league) : []),
    [hasTeam, team, league],
  );

  // Strategy tips for the current team (State 4)
  const strategyTips = useMemo(
    () => (roles.length > 0 ? generateStrategyTips(roles, league) : []),
    [roles, league],
  );

  // CP search string for the copy button (State 1)
  // Includes type restrictions for special cups (e.g. Fantasy Cup: Dragon/Steel/Fairy)
  const cpSearchString = useMemo(() => {
    const cpPart = leagueInfo.cpCap >= 9999
      ? "cp2500-"
      : buildLeagueEligibleString(leagueInfo.cpCap);

    // Add type restrictions for special cups
    if (leagueInfo.typeRestrictions && leagueInfo.typeRestrictions.length > 0) {
      const typePart = leagueInfo.typeRestrictions
        .map((t: string) => `@${t.toLowerCase()}`)
        .join(",");
      return `${cpPart}&${typePart}`;
    }

    return cpPart;
  }, [leagueInfo.cpCap, leagueInfo.typeRestrictions]);

  /* ---------- Handlers ---------- */

  const handleLeagueChange = useCallback(
    (newLeague: LeagueId) => {
      if (newLeague === league) return;
      // Save current team under current league
      const currentIds = team
        .filter((s): s is NonNullable<TeamSlot> => s !== null)
        .map((s) => s.pokemonId);
      saveTeam(league, currentIds);

      // Switch league and load saved team + pool for new league
      setLeague(newLeague);

      const stored = loadTeam(newLeague);
      if (stored.length > 0) {
        setTeam([
          stored[0] ? pokemonToSlot(stored[0]) : null,
          stored[1] ? pokemonToSlot(stored[1]) : null,
          stored[2] ? pokemonToSlot(stored[2]) : null,
        ] as [TeamSlot, TeamSlot, TeamSlot]);
      } else {
        setTeam([null, null, null]);
      }

      // Load advisor state for new league
      const advisorState = loadAdvisorState(newLeague);
      setPool(advisorState.pool);
      setCpCopiedState(advisorState.pool.length > 0 ? advisorState.cpCopied : false);
    },
    [team, league],
  );

  const handleCpCopy = useCallback(async () => {
    await copyToClipboard(cpSearchString);
    setCpCopied(league);
    setCpCopiedState(true);
    if (navigator.vibrate) navigator.vibrate(50);
  }, [cpSearchString, league]);

  const handleSkipToCpCopied = useCallback(() => {
    setCpCopied(league);
    setCpCopiedState(true);
  }, [league]);

  const handleScan = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsScanning(true);
      setScanError(null);

      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append("screenshots", file);
        }

        const response = await fetch(SCAN_API_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          // In dev mode, the Pages Function doesn't exist
          if (response.status === 404) {
            throw new Error("Screenshot scanning requires deployment to Cloudflare. Use the search bar below to add Pokemon manually.");
          }
          throw new Error("Scan failed — try again with a clearer screenshot");
        }

        const data = await response.json();
        const names: string[] = data.pokemon ?? [];

        if (names.length === 0) {
          setScanError("Couldn't read any Pokemon — try a clearer screenshot");
          return;
        }

        const { matched, unmatched } = matchPokemonNames(names);

        // Add all matched Pokemon to pool
        let updatedPool = pool;
        for (const m of matched) {
          updatedPool = addToPool(league, m.id);
        }
        setPool(updatedPool);

        if (unmatched.length > 0) {
          setScanError(
            `Found ${matched.length} of ${names.length} Pokemon. Couldn't match: ${unmatched.join(", ")} (nicknamed?). Add them manually below.`,
          );
        } else if (matched.length < names.length) {
          setScanError(
            `Found ${matched.length} Pokemon (${names.length - matched.length} duplicates removed).`,
          );
        }
      } catch (err) {
        setScanError(
          err instanceof Error ? err.message : "Scan failed — try again",
        );
      } finally {
        setIsScanning(false);
      }
    },
    [pool, league],
  );

  const handlePoolAdd = useCallback(
    (pokemonId: string) => {
      const updatedPool = addToPool(league, pokemonId);
      setPool(updatedPool);
    },
    [league],
  );

  const handlePoolRemove = useCallback(
    (pokemonId: string) => {
      const updatedPool = removeFromPool(league, pokemonId);
      setPool(updatedPool);
      // If pool is now empty, reset cpCopied so we go back to State 1
      if (updatedPool.length === 0) {
        setCpCopiedState(false);
      }
    },
    [league],
  );

  const handleUseTeam = useCallback(
    (pokemonIds: [string, string, string]) => {
      // Reorder by role: lead first, safe-swap second, closer third
      const slots = pokemonIds.map((id) => pokemonToSlot(id));
      const teamRoles = assignRoles(slots, league);
      const roleOrder: Record<string, number> = { lead: 0, "safe-swap": 1, closer: 2 };
      const ordered = [...teamRoles].sort(
        (a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3),
      );
      const newTeam: [TeamSlot, TeamSlot, TeamSlot] = [
        pokemonToSlot(ordered[0]?.pokemonId ?? pokemonIds[0]),
        pokemonToSlot(ordered[1]?.pokemonId ?? pokemonIds[1]),
        pokemonToSlot(ordered[2]?.pokemonId ?? pokemonIds[2]),
      ];
      setTeam(newTeam);
      const ids = newTeam
        .filter((s): s is NonNullable<TeamSlot> => s !== null)
        .map((s) => s.pokemonId);
      saveTeam(league, ids);
      // Scroll to top so My Team is visible
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    },
    [league],
  );

  function handleSlotRemove(index: 0 | 1 | 2) {
    setTeam((prev) => {
      // Remove the Pokemon and compact remaining ones upward (no gaps)
      const filled = prev.filter((s): s is NonNullable<TeamSlot> => s !== null);
      filled.splice(filled.findIndex((s) => s === prev[index]), 1);
      const next: [TeamSlot, TeamSlot, TeamSlot] = [
        filled[0] ?? null,
        filled[1] ?? null,
        filled[2] ?? null,
      ];
      const ids = filled.map((s) => s.pokemonId);
      saveTeam(league, ids);
      return next;
    });
  }

  function handlePokemonSelect(pokemonId: string) {
    if (excludeIds.includes(pokemonId)) return;
    const slot = pokemonToSlot(pokemonId);
    if (!slot) return;
    // Scroll to top so My Team is visible after adding
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      const emptyIndex = next.findIndex((s) => s === null);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : 2;
      next[targetIndex] = slot;

      // When team is full (3 Pokemon), reorder by role: lead → safe-swap → closer
      const filled = next.filter((s): s is NonNullable<TeamSlot> => s !== null);
      if (filled.length === 3) {
        const teamRoles = assignRoles(next, league);
        const roleOrder: Record<string, number> = { lead: 0, "safe-swap": 1, closer: 2 };
        const ordered = [...teamRoles].sort(
          (a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3),
        );
        const sorted: [TeamSlot, TeamSlot, TeamSlot] = [
          pokemonToSlot(ordered[0]!.pokemonId),
          pokemonToSlot(ordered[1]!.pokemonId),
          pokemonToSlot(ordered[2]!.pokemonId),
        ];
        const ids = sorted
          .filter((s): s is NonNullable<TeamSlot> => s !== null)
          .map((s) => s.pokemonId);
        saveTeam(league, ids);
        return sorted;
      }

      const ids = next
        .filter((s): s is NonNullable<TeamSlot> => s !== null)
        .map((s) => s.pokemonId);
      saveTeam(league, ids);
      return next;
    });
  }

  /* ---------- Moveset helper ---------- */

  function getMoveset(pokemonId: string): string | undefined {
    // Try league meta first (has curated recommended moves)
    const meta = (leagueInfo.meta as MetaPokemon[]).find(
      (m) => m.pokemonId === pokemonId,
    );
    if (meta) {
      return `${meta.recommendedFast} | ${meta.recommendedCharged.join(", ")}`;
    }
    // Fallback: first fast move + first 2 charged moves from pokemon.json
    const p = getPokemonById(pokemonId);
    if (!p) return undefined;
    const fast = p.fastMoves[0]?.name;
    const charged = p.chargedMoves.slice(0, 2).map((m) => m.name);
    if (!fast || charged.length === 0) return undefined;
    return `${fast} | ${charged.join(", ")}`;
  }

  /* ---------- Role label for a team slot ---------- */

  const isFullTeam = team.every((s) => s !== null);

  // Suggest pool Pokemon that best complement the current partial team
  // Uses the same scoring as the team advisor: actually scores the full trio
  const suggestedPoolPokemon = useMemo(() => {
    if (isFullTeam || pool.length === 0) return [];
    const teamMembers = team.filter((s): s is NonNullable<TeamSlot> => s !== null);
    if (teamMembers.length === 0) return [];

    const candidates = pool.filter((id) => !excludeIds.includes(id));

    if (teamMembers.length === 1) {
      // 1 on team: we need 2 more — use recommendTeams with pool filtered to include the existing member
      // For now, just score each candidate as if it were added (partial team of 2)
      const scored = candidates.map((id) => {
        const candidateSlot = pokemonToSlot(id);
        if (!candidateSlot) return { id, name: id, score: -999 };
        const trialTeam: TeamSlot[] = [...teamMembers.map(m => m as TeamSlot), candidateSlot];
        const trialAnalysis = analyzeTeam([trialTeam[0]!, trialTeam[1]!, null], league);
        const coverage = trialAnalysis.coverageScore;
        const sharedWeaknesses = trialAnalysis.defensiveWeaknesses.length;
        const score = coverage - sharedWeaknesses * 3;
        const p = getPokemonById(id);
        return { id, name: p?.name ?? id, score };
      });
      return scored.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    if (teamMembers.length === 2) {
      // 2 on team: score each candidate as the 3rd member using full team rating
      const scored = candidates.map((id) => {
        const candidateSlot = pokemonToSlot(id);
        if (!candidateSlot) return { id, name: id, score: -999 };
        const trialTeam: [TeamSlot, TeamSlot, TeamSlot] = [
          teamMembers[0] as TeamSlot,
          teamMembers[1] as TeamSlot,
          candidateSlot,
        ];
        const trialAnalysis = analyzeTeam(trialTeam, league);
        const rating = calculateTeamRating(
          [teamMembers[0]!.pokemonId, teamMembers[1]!.pokemonId, id],
          league,
          trialAnalysis.offensiveCoverage,
          trialAnalysis.defensiveWeaknesses,
          trialAnalysis.threats,
        );
        const ratingScores: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
        const score = (ratingScores[rating] ?? 1) + trialAnalysis.coverageScore / 18;
        const p = getPokemonById(id);
        return { id, name: p?.name ?? id, score };
      });
      return scored.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    return [];
  }, [team, pool, league, isFullTeam, excludeIds]);

  function getRoleLabel(pokemonId: string): string | undefined {
    // Only show roles when all 3 slots are filled
    if (!isFullTeam) return undefined;
    const role = roles.find((r) => r.pokemonId === pokemonId);
    if (!role) return undefined;
    const labels: Record<string, string> = {
      lead: "Lead",
      "safe-swap": "Safe Swap",
      closer: "Closer",
    };
    return labels[role.role] ?? role.role;
  }

  /* ---------- Render ---------- */

  return (
    <div className="space-y-5 pb-8">
      <FixedHeader>
        <h1 className="text-xl font-bold">Team Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build your best team for any league. Scan your Pokemon or add them manually.
        </p>

        {/* League tabs */}
        <div className="mt-3 flex gap-1.5">
          {(LEAGUE_IDS as readonly string[]).map((id) => {
            const isActive = league === id;
            const hasSavedTeam =
              mounted &&
              (() => {
                try {
                  const stored = localStorage.getItem(`poke-pal:team:${id}`);
                  if (!stored) return false;
                  const parsed = JSON.parse(stored);
                  return Array.isArray(parsed) && parsed.length > 0;
                } catch {
                  return false;
                }
              })();
            return (
              <button
                key={id}
                onClick={() => handleLeagueChange(id as LeagueId)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : hasSavedTeam
                      ? "border-2 border-primary/40 text-foreground"
                      : "border text-muted-foreground"
                }`}
              >
                {LEAGUE_SHORT_NAMES[id] ?? id}
              </button>
            );
          })}
        </div>

        {/* Copy buttons — side by side */}
        <div className="mt-2 flex gap-2">
          <CopyIconButton
            label="League"
            searchString={cpSearchString}
            onCopy={handleCpCopy}
          />
          <CopyIconButton
            label="My Team"
            searchString={analysis.searchString || ""}
            disabled={!hasTeam || !analysis.searchString}
          />
        </div>
      </FixedHeader>

      {/* ============ BODY CONTENT ============ */}

      {/* States 1 & 2: Building pool */}
      {(state === 1 || state === 2) && (
        <div className="space-y-4">
          <PokemonPool
            pool={pool}
            onRemove={handlePoolRemove}
            onAdd={handlePoolAdd}
            onAddToTeam={handlePokemonSelect}
            teamIds={excludeIds}
            defaultOpen
            onScan={handleScan}
            isScanning={isScanning}
            scanError={scanError}
          />
        </div>
      )}

      {/* State 3: Recommendations */}
      {state === 3 && (
        <div className="space-y-4">
          <PokemonPool
            pool={pool}
            onRemove={handlePoolRemove}
            onAdd={handlePoolAdd}
            onAddToTeam={handlePokemonSelect}
            teamIds={excludeIds}
            defaultOpen
            onScan={handleScan}
            isScanning={isScanning}
            scanError={scanError}
          />

          <RecommendedTeams
            teams={recommendations}
            leagueId={league}
            onUseTeam={handleUseTeam}
            defaultOpen={false}
          />
        </div>
      )}

      {/* State 4: Team loaded */}
      {state === 4 && (
        <div className="space-y-4">
          {/* My Team — collapsible, starts expanded */}
          <MyTeamSection
            team={team}
            getRoleLabel={getRoleLabel}
            getMoveset={getMoveset}
            onSlotRemove={handleSlotRemove}
            onAddToTeam={handlePokemonSelect}
            tips={strategyTips}
            gapTypes={analysis.offensiveCoverage
              .filter((c) => c.multiplier <= 1.0)
              .map((c) => c.type)
              .slice(0, 3)}
            weaknesses={analysis.defensiveWeaknesses.map((w) => ({
              type: w.type,
              members: w.coveredBy,
            }))}
            cpCap={leagueInfo.cpCap}
            rating={isFullTeam ? calculateTeamRating(
              excludeIds,
              league,
              analysis.offensiveCoverage,
              analysis.defensiveWeaknesses,
              analysis.threats,
            ) : null}
            ratingLabel={isFullTeam ? RATING_LABELS[calculateTeamRating(
              excludeIds,
              league,
              analysis.offensiveCoverage,
              analysis.defensiveWeaknesses,
              analysis.threats,
            )] : null}
            coverageScore={analysis.coverageScore}
            suggestedPoolPokemon={suggestedPoolPokemon}
          />

          {/* Pool — collapsed */}
          <PokemonPool
            pool={pool}
            onRemove={handlePoolRemove}
            onAdd={handlePoolAdd}
            onAddToTeam={handlePokemonSelect}
            teamIds={excludeIds}
            defaultOpen={false}
            onScan={handleScan}
            isScanning={isScanning}
            scanError={scanError}
          />

          {/* Recommendations — collapsed header only */}
          {recommendations.length > 0 && (
            <RecommendedTeams
              teams={recommendations}
              leagueId={league}
              onUseTeam={handleUseTeam}
              defaultOpen={false}
            />
          )}

          {/* Meta Threats — collapsible, starts collapsed */}
          {analysis.threats.length > 0 && (
            <MetaThreatsSection threats={analysis.threats} />
          )}
        </div>
      )}
    </div>
  );
}
