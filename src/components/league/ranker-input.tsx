"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { scrollToSectionAfterKeyboardDismiss } from "@/lib/keyboard-dismiss";
import { CopyIconButton } from "@/components/copy-icon-button";
import { useLeagueRankings } from "@/hooks/use-league-rankings";
import { lookupRanking, ourIdToPvpoke, type RankResult } from "@/lib/ranker";
import searchIndex from "@/data/pokemon-search-index.json";

type SearchEntry = { id: string; name: string };
const INDEX = searchIndex as SearchEntry[];

const TIER_COLORS: Record<string, string> = {
  S: "text-yellow-500",
  A: "text-green-500",
  B: "text-blue-500",
  C: "text-muted-foreground",
  D: "text-muted-foreground/50",
};

export function RankerInput({ leagueId }: { leagueId: string }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { rankings, total, loading } = useLeagueRankings(leagueId);

  // Reset ranker when league changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setQuery("");
    setSelectedId(null);
    setShowDropdown(false);
  }, [leagueId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().slice(0, 50).replace(/[^\w\s-]/g, "");
    return INDEX.filter(
      (p) =>
        p.name.toLowerCase().startsWith(q) ||
        p.id.startsWith(q),
    ).slice(0, 8);
  }, [query]);

  const result: RankResult | null = useMemo(() => {
    if (!selectedId || rankings.size === 0) return null;
    return lookupRanking(rankings, ourIdToPvpoke(selectedId), total);
  }, [selectedId, rankings, total]);

  const handleSelect = useCallback((id: string, name: string) => {
    setSelectedId(id);
    setQuery(name);
    setShowDropdown(false);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setSelectedId(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoCapitalize="none"
          enterKeyHint="search"
          maxLength={50}
          placeholder="How does YOUR pokemon rank?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query && !selectedId) setShowDropdown(true);
          }}
          onBlur={() => {
            scrollToSectionAfterKeyboardDismiss(inputRef.current);
          }}
          className="w-full rounded-lg border bg-background px-3 py-2.5 pr-9 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && !selectedId && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[50vh] overflow-y-auto rounded-lg border bg-background shadow-lg"
          >
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id, p.name)}
                className="flex w-full items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-accent active:bg-accent"
              >
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && query.length >= 1 && filtered.length === 0 && !selectedId && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-background p-3 text-muted-foreground shadow-lg">
            No pokemon matches &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Result */}
      {loading && selectedId && (
        <div className="rounded-lg border p-3 text-muted-foreground">
          Loading rankings...
        </div>
      )}

      {result && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${TIER_COLORS[result.tier] ?? ""}`}>
                {result.tier}
              </span>
              <span className="font-semibold">{result.entry.speciesName}</span>
            </div>
            <span className="text-muted-foreground tabular-nums">
              #{result.entry.rank} / {result.total}
            </span>
          </div>

          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{result.entry.moveset[0]}</span>
            {" · "}
            {result.entry.moveset.slice(1).map((m, i) => (
              <span key={m}>
                {i > 0 && " / "}
                {result.entry.elite.includes(m) ? (
                  <span className="text-yellow-600">{m} ★</span>
                ) : (
                  m
                )}
              </span>
            ))}
          </div>

          {result.entry.elite.length > 0 && (
            <p className="text-[13px] text-yellow-600">
              ★ = Elite TM / Legacy move
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">
              Score: <span className="font-medium text-foreground">{result.entry.score}</span>
            </span>
            <CopyIconButton
              label="Copy"
              searchString={result.entry.speciesName.toLowerCase().replace(/[^a-z0-9]+/g, ",")}
            />
          </div>
        </div>
      )}

      {selectedId && !loading && !result && (
        <div className="rounded-lg border p-3 text-muted-foreground">
          Not ranked in this league. This pokemon may not be eligible or competitive here.
        </div>
      )}
    </div>
  );
}
