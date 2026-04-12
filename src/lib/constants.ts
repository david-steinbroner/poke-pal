export const APP_VERSION = "1.2.0";

/** Cloudflare Pages Function endpoint for screenshot scanning */
export const SCAN_API_URL = "/api/scan";

// League IDs, names, and short names are now in @/data/leagues/index.ts
// Re-export for backward compatibility
export { LEAGUE_IDS, LEAGUE_SHORT_NAMES } from "@/data/leagues";
export { ALL_LEAGUES as LEAGUE_LIST } from "@/data/leagues";

/** Full league names — derived from data */
export { LEAGUE_MAP } from "@/data/leagues";

export const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-green-500",
  Ice: "bg-cyan-500",
  Fighting: "bg-red-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-600",
  Flying: "bg-indigo-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-amber-700",
  Ghost: "bg-purple-700",
  Dragon: "bg-indigo-600",
  Dark: "bg-stone-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-400",
};
