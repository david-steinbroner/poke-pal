import { describe, it, expect } from "vitest";
import { analyzeTeam, getPokemonById } from "@/lib/team-analysis";
import type { TeamSlot } from "@/lib/team-types";
import type { PokemonType } from "@/lib/types";

function makeSlot(id: string): TeamSlot {
  const p = getPokemonById(id);
  if (!p) return null;
  return {
    pokemonId: p.id,
    name: p.name,
    types: p.types as PokemonType[],
    fastMoves: p.fastMoves.map((m) => ({ name: m.name, type: m.type as PokemonType })),
    chargedMoves: p.chargedMoves.map((m) => ({ name: m.name, type: m.type as PokemonType })),
  };
}

describe("analyzeTeam", () => {
  it("returns coverage for a 3-Pokemon team", () => {
    const team = [
      makeSlot("medicham"),
      makeSlot("registeel"),
      makeSlot("stunfisk-galarian"),
    ];
    const result = analyzeTeam(team, "great-league");
    expect(result.offensiveCoverage.length).toBe(18);
    expect(result.coverageScore).toBeGreaterThan(0);
    expect(result.searchString).toContain("medicham");
    expect(result.searchString).toContain("cp-1500");
  });

  it("returns empty analysis for empty team", () => {
    const result = analyzeTeam([null, null, null], "great-league");
    expect(result.coverageScore).toBe(0);
    expect(result.searchString).toBe("");
  });

  it("detects defensive weaknesses", () => {
    // 3 Dragon types = all weak to Ice, Dragon, Fairy
    const team = [
      makeSlot("garchomp"),
      makeSlot("dragonite"),
      makeSlot("salamence"),
    ];
    const result = analyzeTeam(team, "master-league");
    const iceWeakness = result.defensiveWeaknesses.find((w) => w.type === "Ice");
    expect(iceWeakness).toBeDefined();
    expect(iceWeakness!.coveredBy.length).toBeGreaterThanOrEqual(2);
  });

  it("suggests swaps from meta", () => {
    const team = [makeSlot("medicham"), makeSlot("registeel"), null];
    const result = analyzeTeam(team, "great-league");
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0]!.reason).toBeTruthy();
  });

  it("handles Fantasy Cup with type restrictions", () => {
    const team = [makeSlot("registeel"), makeSlot("altaria"), null];
    const result = analyzeTeam(team, "fantasy-cup");
    expect(result.searchString).toContain("cp-1500");
  });
});
