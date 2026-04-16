"use client";

import { useState, useRef, useEffect } from "react";
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
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current?.closest("[id]");
    if (!el) return;
    const hash = window.location.hash.slice(1);
    if (hash && el.id === hash) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [open]);

  return (
    <div className="rounded-lg border scroll-mt-[var(--fixed-header-h,72px)]">
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
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm">{name}</span>
          {subtitle && (
            <span className="block text-sm text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
      </button>

      {/* Quote tag — visible when collapsed */}
      {!open && taunt && (
        <div className="px-3 pb-2.5 -mt-1">
          <span className="inline-block rounded-md bg-muted/50 px-2 py-0.5 text-sm italic text-muted-foreground">
            &ldquo;{taunt}&rdquo;
          </span>
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div
          ref={bodyRef}
          className="space-y-3 px-3 pb-3"
        >
          {/* Taunt quote */}
          {taunt && (
            <p className="italic text-muted-foreground">
              &ldquo;{taunt}&rdquo;
            </p>
          )}

          {/* Enemy lineup with type badge */}
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span>They Use</span>
              {type && <TypeBadge type={type} variant="muted" />}
            </p>
            {slots.map((slotOptions, i) => (
              <p key={i} className="text-sm">
                <span className="text-muted-foreground">Slot {i + 1}: </span>
                {slotOptions.join(", ")}
              </p>
            ))}
          </div>

          {/* Counter by Type — NOW FIRST (was second) */}
          {counterTypes && counterTypes.team.length > 0 && (
            <CollapsibleSubSection label="Counter by Type" defaultOpen>
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

              <div className="pt-1">
                <CopyIconButton
                  label="Copy Counter Types"
                  searchString={counterTypes.searchString}
                />
              </div>
            </CollapsibleSubSection>
          )}

          {/* Best Counter Pokemon — NOW SECOND (was first) */}
          <CollapsibleSubSection label="Best Counter Pokemon">
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

            <div className="pt-1">
              <CopyIconButton
                label="Copy Counter Team"
                searchString={counters.searchString}
              />
            </div>
          </CollapsibleSubSection>
        </div>
      )}
    </div>
  );
}
