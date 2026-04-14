"use client";

import { FixedHeader } from "@/components/fixed-header";
import { CollapsibleSection } from "@/components/home/collapsible-section";
import { RocketEncounterCard } from "@/components/rocket/rocket-encounter-card";
import { CopyIconButton } from "@/components/copy-icon-button";
import { TypeBadge } from "@/components/type-badge";
import rocketData from "@/data/rocket-lineups.json";

/** Parse fallbackString like "@1fighting,@1water" into ["Fighting", "Water"] */
function parseKeyTypes(fallbackString: string): string[] {
  return fallbackString
    .split(",")
    .map((s) => s.replace("@1", "").trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
}

const ESSENTIALS = [
  { name: "Machamp", type: "Fighting", role: "Normal, Dark, Steel, Ice, Rock grunts + Leaders" },
  { name: "Swampert", type: "Water", role: "Fire, Rock, Ground grunts + Giovanni" },
  { name: "Mamoswine", type: "Ice", role: "Dragon, Flying, Grass grunts + Leaders" },
  { name: "Tyranitar", type: "Dark", role: "Psychic, Ghost grunts" },
  { name: "Chandelure", type: "Fire", role: "Bug, Grass, Steel, Fairy grunts" },
  { name: "Togekiss", type: "Fairy", role: "Fighting, Dragon, Dark grunts" },
];

const ESSENTIALS_SEARCH = ESSENTIALS.map((e) => e.name.toLowerCase()).join(",");

export default function RocketsPage() {
  const { grunts, leaders, giovanni, lastUpdated } = rocketData;

  return (
    <div className="space-y-5 pb-8">
      <FixedHeader>
        <h1 className="text-xl font-bold">Team Rocket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Counter teams for every Grunt, Leader, and Giovanni.
        </p>
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

      {/* Giovanni — always expanded */}
      <CollapsibleSection id="rocket-giovanni" label="GIOVANNI">
        <RocketEncounterCard
          name={giovanni.name}
          subtitle={giovanni.subtitle}
          slots={giovanni.slots}
          counters={giovanni.counters}
          counterTypes={giovanni.counterTypes}
          keyTypes={parseKeyTypes(giovanni.counters.fallbackString)}
          defaultOpen
        />
      </CollapsibleSection>

      {/* Rocket Essentials — at bottom */}
      <CollapsibleSection id="rocket-essentials" label="ROCKET ESSENTIALS">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Power up these 6 and you can handle almost every Rocket encounter.
          </p>
          <div className="space-y-1.5">
            {ESSENTIALS.map((e) => (
              <div key={e.name} className="flex items-center gap-2 text-sm">
                <TypeBadge type={e.type} />
                <span className="font-medium">{e.name}</span>
                <span className="text-muted-foreground">— {e.role}</span>
              </div>
            ))}
          </div>
          <CopyIconButton
            label="Copy Squad"
            searchString={ESSENTIALS_SEARCH}
          />
        </div>
      </CollapsibleSection>

      {/* Data freshness */}
      <p className="text-center text-sm text-muted-foreground/50">
        Lineups as of {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
