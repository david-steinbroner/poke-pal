"use client";

import { FixedHeader } from "@/components/fixed-header";
import { CollapsibleSection } from "@/components/home/collapsible-section";
import { RocketEncounterCard } from "@/components/rocket/rocket-encounter-card";
import rocketData from "@/data/rocket-lineups.json";

/** Parse fallbackString like "@1fighting,@1water" into ["Fighting", "Water"] */
function parseKeyTypes(fallbackString: string): string[] {
  return fallbackString
    .split(",")
    .map((s) => s.replace("@1", "").replace("@", "").trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
}

export default function RocketsPage() {
  const { grunts, leaders, giovanni, lastUpdated } = rocketData;

  return (
    <div className="flex flex-1 flex-col space-y-3">
      <FixedHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Team Rocket</h1>
          <span aria-hidden className="invisible rounded-lg border px-2.5 py-1.5 text-sm">.</span>
        </div>
      </FixedHeader>

      {/* Grunts — collapsed by default */}
      <CollapsibleSection id="rocket-grunts" label="GRUNTS">
        <div className="space-y-2">
          {grunts.map((grunt) => (
            <RocketEncounterCard
              key={grunt.id}
              name={grunt.name}
              type={grunt.type}
              taunt={grunt.taunt}
              slots={grunt.slots}
              counters={grunt.counters}
              counterTypes={grunt.counterTypes}
              keyTypes={parseKeyTypes(grunt.counters.fallbackString)}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Leaders — expanded by default */}
      <CollapsibleSection id="rocket-leaders" label="LEADERS">
        <div className="space-y-2">
          {leaders.map((leader) => (
            <RocketEncounterCard
              key={leader.id}
              name={leader.name}
              slots={leader.slots}
              counters={leader.counters}
              counterTypes={leader.counterTypes}
              keyTypes={parseKeyTypes(leader.counters.fallbackString)}
              defaultOpen
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Giovanni — always expanded, no name (section header says it) */}
      <CollapsibleSection id="rocket-giovanni" label="GIOVANNI">
        <RocketEncounterCard
          name=""
          subtitle={giovanni.subtitle}
          slots={giovanni.slots}
          counters={giovanni.counters}
          counterTypes={giovanni.counterTypes}
          keyTypes={parseKeyTypes(giovanni.counters.fallbackString)}
          defaultOpen
        />
      </CollapsibleSection>

      <footer className="mt-auto text-center text-xs text-muted-foreground/40">
        <p>Updated {lastUpdated}</p>
      </footer>
    </div>
  );
}
