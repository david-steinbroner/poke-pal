"use client";

import { BackButton } from "@/components/back-button";
import { FixedHeader } from "@/components/fixed-header";
import { TypeBadge } from "@/components/type-badge";
import { CopyIconButton } from "@/components/copy-icon-button";
import { PokemonListItem } from "@/components/pokemon-list-item";
import { CollapsibleSubSection } from "@/components/rocket/collapsible-sub-section";

type CounterEntry = {
  name: string;
  fastMove: string;
  chargedMoves: string[];
};

type WeakToEntry = {
  type: string;
  isDouble: boolean;
};

type CounterPageClientProps = {
  pokemonName: string;
  pokemonTypes: string[];
  typeSearchString: string;
  topCountersSearchString: string;
  weakTo: WeakToEntry[];
  resists: string[];
  topCounters: CounterEntry[];
  budgetCounters: CounterEntry[];
};

export function CounterPageClient({
  pokemonName,
  pokemonTypes,
  typeSearchString,
  topCountersSearchString,
  weakTo,
  resists,
  topCounters,
  budgetCounters,
}: CounterPageClientProps) {
  return (
    <div className="space-y-5">
      <FixedHeader>
        <BackButton />
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold">{pokemonName}</h1>
          {pokemonTypes.map((t) => (
            <TypeBadge key={t} type={t} variant="muted" />
          ))}
        </div>
      </FixedHeader>

      {/* Type effectiveness */}
      <div className="space-y-3">
        {weakTo.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Weak to</span>
            {weakTo.map(({ type, isDouble }) => (
              <span key={type} className="inline-flex items-center gap-0.5">
                <TypeBadge type={type} />
                {isDouble && (
                  <span className="text-sm font-medium text-muted-foreground">2×</span>
                )}
              </span>
            ))}
          </div>
        )}
        {resists.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Resists</span>
            {resists.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>

      {/* Counter by Type — first, with copy button */}
      {typeSearchString && (
        <CollapsibleSubSection label="Counter by Type" defaultOpen>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {weakTo.map(({ type }) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Search for pokemon with moves super-effective against {pokemonName}.
            </p>
            <CopyIconButton
              label="Copy Counter Types"
              searchString={typeSearchString}
            />
          </div>
        </CollapsibleSubSection>
      )}

      {/* Top Counters — second, with copy button */}
      {topCounters.length > 0 && (
        <CollapsibleSubSection label="Top Counters" defaultOpen>
          <div className="space-y-2">
            {topCounters.map((counter) => (
              <PokemonListItem
                key={counter.name}
                name={counter.name}
                fastMove={counter.fastMove}
                chargedMoves={counter.chargedMoves}
              />
            ))}
            <CopyIconButton
              label="Copy Top Counters"
              searchString={topCountersSearchString}
            />
          </div>
        </CollapsibleSubSection>
      )}

      {/* Budget Picks */}
      {budgetCounters.length > 0 && (
        <CollapsibleSubSection label="Budget Picks">
          <div className="space-y-2">
            {budgetCounters.map((counter) => (
              <PokemonListItem
                key={counter.name}
                name={counter.name}
                fastMove={counter.fastMove}
                chargedMoves={counter.chargedMoves}
              />
            ))}
          </div>
        </CollapsibleSubSection>
      )}
    </div>
  );
}
