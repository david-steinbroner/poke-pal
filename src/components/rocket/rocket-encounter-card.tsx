"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { TypeBadge } from "@/components/type-badge";
import { CopyIconButton } from "@/components/copy-icon-button";

type CounterPick = {
  id: string;
  name: string;
  fastMove: string;
  chargedMoves: string[];
  why?: string;
};

type RocketEncounterCardProps = {
  name: string;
  type?: string;
  taunt?: string;
  subtitle?: string;
  slots: string[][];
  counters: {
    pokemon: CounterPick[];
    searchString: string;
    fallbackString: string;
  };
  keyTypes?: string[];
  defaultOpen?: boolean;
};

export function RocketEncounterCard({
  name,
  type,
  taunt,
  subtitle,
  slots,
  counters,
  keyTypes,
  defaultOpen = false,
}: RocketEncounterCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border">
      {/* Header — always visible, tappable */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full min-h-11 items-center gap-2 px-3 py-2.5 text-left active:opacity-70 transition-opacity"
      >
        {open ? (
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        {type && <TypeBadge type={type} />}
        <span className="font-semibold text-sm">{name}</span>
        {subtitle && (
          <span className="ml-auto text-sm text-muted-foreground truncate">
            {subtitle}
          </span>
        )}
      </button>

      {/* Expanded body */}
      {open && (
        <div className="space-y-3 px-3 pb-3">
          {/* Taunt quote */}
          {taunt && (
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{taunt}&rdquo;
            </p>
          )}

          {/* Enemy lineup */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              They Use
            </p>
            {slots.map((slotOptions, i) => (
              <p key={i} className="text-sm">
                <span className="text-muted-foreground">Slot {i + 1}: </span>
                {slotOptions.join(", ")}
              </p>
            ))}
          </div>

          {/* Counter team */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Counters
            </p>
            {counters.pokemon.map((pick) => (
              <div key={pick.id} className="text-sm">
                <p>
                  <span className="font-medium">{pick.name}</span>
                  <span className="text-muted-foreground">
                    {" · "}
                    {pick.fastMove} | {pick.chargedMoves.join(", ")}
                  </span>
                </p>
                {pick.why && (
                  <p className="text-muted-foreground text-[13px]">
                    {pick.why}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Key types needed */}
          {keyTypes && keyTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Key types:
              </span>
              {keyTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          )}

          {/* Copy button + search string note */}
          <div className="space-y-1">
            <CopyIconButton
              label="Copy Counter Team"
              searchString={counters.searchString}
            />
            <p className="text-[12px] text-muted-foreground text-center">
              Searches: {counters.searchString}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
