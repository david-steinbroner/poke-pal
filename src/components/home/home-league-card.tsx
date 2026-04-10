"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { getPokemonName } from "@/lib/pokemon-utils";
import { isCollapsed, setCollapsed } from "@/lib/home-collapse-storage";

type HomeLeagueCardProps = {
  leagueId: string;
  leagueName: string;
  metaPokemonIds: string[];
  searchString: string;
  /** Max pills to show before "See more" */
  maxPills?: number;
};

export function HomeLeagueCard({
  leagueId,
  leagueName,
  metaPokemonIds,
  searchString,
  maxPills = 9,
}: HomeLeagueCardProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOpen(!isCollapsed(`league:${leagueId}`));
    setMounted(true);
  }, [leagueId]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setCollapsed(`league:${leagueId}`, !next);
  }

  const visiblePokemon = metaPokemonIds.slice(0, maxPills);
  const hasMore = metaPokemonIds.length > maxPills;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between min-h-11 active:opacity-70 transition-opacity"
      >
        <span className="text-base font-semibold">{leagueName}</span>
        {mounted && open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        )}
      </button>

      {mounted && open && (
        <>
          <p className="text-[13px] text-muted-foreground italic">
            Top performing metas:
          </p>
          <div className="flex flex-wrap gap-2">
            {visiblePokemon.map((id) => (
              <Link
                key={id}
                href={`/counter/${id}`}
                className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {getPokemonName(id)}
              </Link>
            ))}
            {hasMore && (
              <Link
                href={`/league/${leagueId}`}
                className="inline-flex min-h-11 items-center px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                See more →
              </Link>
            )}
          </div>
          <CopyButton
            searchString={searchString}
            label="Copy Full Meta Search String"
          />
        </>
      )}
    </div>
  );
}
