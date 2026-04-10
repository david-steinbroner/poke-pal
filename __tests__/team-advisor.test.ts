import { describe, it, expect } from "vitest";
import { recommendTeams, generateStrategyTips } from "@/lib/team-advisor";
import { assignRoles } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";

// Real Pokemon IDs from the dataset
const POOL = ["dragonite", "venusaur", "feraligatr", "swampert", "togekiss", "machamp"];

describe("recommendTeams", () => {
  it("returns up to 5 ranked teams from a pool", () => {
    const results = recommendTeams(POOL, "great-league");
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.length).toBeGreaterThan(0);

    for (const team of results) {
      expect(team.pokemonIds).toHaveLength(3);
      expect(team.rating).toBeDefined();
      expect(team.score).toBeTypeOf("number");
      expect(team.coverageScore).toBeGreaterThanOrEqual(0);
      expect(team.roles.length).toBe(3);
      expect(team.searchString).toBeTruthy();
      expect(team.tips.length).toBe(3);
    }
  });

  it("returns teams sorted by score descending", () => {
    const results = recommendTeams(POOL, "great-league");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it("returns empty for pool smaller than 3", () => {
    expect(recommendTeams(["swampert", "machamp"], "great-league")).toEqual([]);
    expect(recommendTeams(["swampert"], "great-league")).toEqual([]);
    expect(recommendTeams([], "great-league")).toEqual([]);
  });

  it("handles pool of exactly 3", () => {
    const results = recommendTeams(
      ["swampert", "machamp", "togekiss"],
      "great-league",
    );
    // Exactly one combination possible
    expect(results).toHaveLength(1);
    expect(results[0]!.pokemonIds).toHaveLength(3);
    expect(results[0]!.tips.length).toBe(3);
  });

  it("skips invalid Pokemon IDs", () => {
    const results = recommendTeams(
      ["swampert", "machamp", "togekiss", "not-a-pokemon", "also-fake"],
      "great-league",
    );
    // Only 3 valid IDs, so exactly 1 combo
    expect(results).toHaveLength(1);
    // Ensure no invalid IDs snuck through
    for (const team of results) {
      for (const id of team.pokemonIds) {
        expect(POOL.concat(["swampert", "machamp", "togekiss"])).toContain(id);
      }
    }
  });
});

describe("generateStrategyTips", () => {
  it("generates 3 tips for a full team with roles", () => {
    const team = [
      pokemonToSlot("swampert"),
      pokemonToSlot("machamp"),
      pokemonToSlot("togekiss"),
    ];
    const roles = assignRoles(team, "great-league");
    const tips = generateStrategyTips(roles, "great-league");

    expect(tips).toHaveLength(3);

    const tipRoles = tips.map((t) => t.role);
    expect(tipRoles).toContain("lead");
    expect(tipRoles).toContain("safe-swap");
    expect(tipRoles).toContain("closer");

    for (const tip of tips) {
      expect(tip.pokemonId).toBeTruthy();
      expect(tip.pokemonName).toBeTruthy();
      expect(tip.tip).toBeTruthy();
    }
  });

  it("returns empty for no roles", () => {
    const tips = generateStrategyTips([], "great-league");
    expect(tips).toEqual([]);
  });

  it("mentions move names in tips", () => {
    const team = [
      pokemonToSlot("swampert"),
      pokemonToSlot("machamp"),
      pokemonToSlot("togekiss"),
    ];
    const roles = assignRoles(team, "great-league");
    const tips = generateStrategyTips(roles, "great-league");

    // Every tip should mention at least one move or Pokemon name
    for (const tip of tips) {
      // Check that the tip text contains something meaningful (not empty)
      expect(tip.tip.length).toBeGreaterThan(5);
      // At least one tip should reference a real move name
    }

    // Collect all tip text and verify at least some known moves appear
    const allTipText = tips.map((t) => t.tip).join(" ");
    const knownMoves = [
      "Counter", "Cross Chop", "Rock Slide", "Mud Shot",
      "Hydro Cannon", "Earthquake", "Charm", "Aerial Ace",
      "Flamethrower", "Ancient Power", "Dazzling Gleam",
    ];
    const mentionedMoves = knownMoves.filter((m) => allTipText.includes(m));
    expect(mentionedMoves.length).toBeGreaterThan(0);
  });
});
