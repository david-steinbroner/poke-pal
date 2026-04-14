import { getPokemonName } from "@/lib/pokemon-utils";
import { buildNameSearchString, buildLeagueEligibleString } from "@/lib/search-string";
import currentRaids from "@/data/current-raids.json";
import pokemonData from "@/data/pokemon.json";
import { getActiveLeagues } from "@/data/leagues";
import { HomeClient } from "@/components/home/home-client";

const activeLeagues = getActiveLeagues();

// Build league data with search strings (at build time)
const leagueData = activeLeagues.map((league) => {
  const metaNames = league.meta.map((m) => {
    const pokemon = pokemonData.find((p) => p.id === m.pokemonId);
    return pokemon?.name ?? m.pokemonId;
  });
  const metaSearchString = buildNameSearchString(metaNames);
  const cpString = buildLeagueEligibleString(league.cpCap);
  const fullSearchString =
    league.cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  return {
    id: league.id,
    name: league.name,
    searchString: fullSearchString,
  };
});

// Home-page raid chips show only the base name. Regional forms (Alolan,
// Galarian, Hisuian, Paldean), Shadow, and Mega suffixes are stripped here —
// the counter page itself still shows the full name.
function cleanDisplayName(id: string): string {
  return getPokemonName(id).replace(
    /\s*\((?:Shadow|Mega|Alolan|Galarian|Hisuian|Paldean)\)/gi,
    "",
  );
}

type RaidTier = 1 | 3 | 5 | "mega" | "dynamax";
type RaidBoss = {
  id: string;
  name: string;
  tier: RaidTier;
  shadow: boolean;
  mega: boolean;
  dynamax: boolean;
};

// Prefer the structured `bosses` array if present; fall back to legacy arrays.
type RichBoss = { id: string; tier: 1 | 3 | 5 | "mega"; shadow: boolean };
const structuredBosses: RichBoss[] = Array.isArray(
  (currentRaids as { bosses?: RichBoss[] }).bosses,
)
  ? (currentRaids as { bosses: RichBoss[] }).bosses
  : [];

const raidBosses: RaidBoss[] = (
  structuredBosses.length > 0
    ? structuredBosses.map((b) => ({
        id: b.id,
        tier: b.tier,
        shadow: b.shadow,
        mega: b.tier === "mega",
        dynamax: false,
      }))
    : [
        ...currentRaids.fivestar.map((id) => ({ id, tier: 5 as const, shadow: false, mega: false, dynamax: false })),
        ...currentRaids.threestar.map((id) => ({ id, tier: 3 as const, shadow: false, mega: false, dynamax: false })),
        ...currentRaids.onestar.map((id) => ({ id, tier: 1 as const, shadow: false, mega: false, dynamax: false })),
        ...currentRaids.mega.map((id) => ({ id, tier: "mega" as const, shadow: false, mega: true, dynamax: false })),
        ...currentRaids.shadow.map((id) => ({ id, tier: 5 as const, shadow: true, mega: false, dynamax: false })),
        ...currentRaids.dynamax.map((id) => ({ id, tier: "dynamax" as const, shadow: false, mega: false, dynamax: true })),
      ]
)
  .filter(({ id }) => pokemonData.some((p) => p.id === id))
  .map(({ id, tier, shadow, mega, dynamax }) => ({
    id,
    name: cleanDisplayName(id),
    tier,
    shadow,
    mega,
    dynamax,
  }));

// Sort order: non-shadow tiers high→low (5, 3, 1), then non-shadow mega,
// then all shadows (by tier high→low). Dynamax slots between mega and shadow.
function sortRank(b: { tier: typeof raidBosses[number]["tier"]; shadow: boolean; mega: boolean; dynamax: boolean }): number {
  if (b.shadow) {
    const t = typeof b.tier === "number" ? b.tier : 0;
    return 200 - t; // 195..199, shadows grouped at the end
  }
  if (b.dynamax) return 150;
  if (b.mega) return 100;
  if (typeof b.tier === "number") return 10 - b.tier; // 5 → 5, 3 → 7, 1 → 9
  return 99;
}
raidBosses.sort((a, b) => sortRank(a) - sortRank(b));

export default function Home() {
  return (
    <HomeClient
      leagues={leagueData}
      raidBosses={raidBosses}
    />
  );
}
