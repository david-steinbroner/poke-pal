"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { TypeBadge } from "@/components/type-badge";
import { CopyIconButton } from "@/components/copy-icon-button";
import { CollapsibleSubSection } from "@/components/rocket/collapsible-sub-section";

type CounterPick = {
  id: string;
  name: string;
  fastMove: string;
  chargedMoves: string[];
  why?: string;
};

type CounterTypeEntry = {
  type: string;
  count: number;
  beats: string;
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
  counterTypes?: {
    team: CounterTypeEntry[];
    searchString: string;
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
  counterTypes,
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

          {/* Best Counter Pokemon — collapsible, expanded by default */}
          <CollapsibleSubSection label="Best Counter Pokemon" defaultOpen>
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

            {/* Key types needed */}
            {keyTypes && keyTypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Key types:
                </span>
                {keyTypes.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            )}

            {/* Copy button */}
            <div className="pt-1">
              <CopyIconButton
                label="Copy Counter Team"
                searchString={counters.searchString}
              />
            </div>
          </CollapsibleSubSection>

          {/* Counter by Type — collapsible, collapsed by default */}
          {counterTypes && counterTypes.team.length > 0 && (
            <CollapsibleSubSection label="Counter by Type">
              {counterTypes.team.map((entry) => (
                <div key={entry.type} className="flex items-start gap-2 text-sm">
                  <span className="font-medium shrink-0">
                    {entry.count} <TypeBadge type={entry.type} />
                  </span>
                  <span className="text-muted-foreground">
                    — beats {entry.beats}
                  </span>
                </div>
              ))}

              {/* Copy button */}
              <div className="pt-1">
                <CopyIconButton
                  label="Copy Counter Types"
                  searchString={counterTypes.searchString}
                />
              </div>
            </CollapsibleSubSection>
          )}
        </div>
      )}
    </div>
  );
}
