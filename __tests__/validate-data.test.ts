import { describe, it, expect } from "vitest";
import { validateLeagues, validatePokemon } from "../scripts/validate-data";

describe("validateLeagues", () => {
  it("warns if all leagues are inactive", () => {
    const result = validateLeagues([
      { id: "test", active: false, endDate: "2026-01-01", lastUpdated: "2026-01-01", meta: [] },
    ]);
    expect(result.warnings).toContain("All leagues are inactive");
  });

  it("warns if endDate is in the past", () => {
    const result = validateLeagues([
      { id: "test", active: true, endDate: "2025-01-01", lastUpdated: "2025-01-01", meta: [] },
    ]);
    expect(result.warnings.some((w: string) => w.includes("past"))).toBe(true);
  });

  it("passes for valid active league", () => {
    const result = validateLeagues([
      { id: "test", active: true, endDate: "2099-01-01", lastUpdated: "2026-04-07", meta: [{ pokemonId: "test", tier: "S" }] },
    ]);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("validatePokemon", () => {
  it("errors if Pokemon has no types", () => {
    const result = validatePokemon([{ id: "test", types: [], fastMoves: [{}], chargedMoves: [{}] }]);
    expect(result.errors.some((e) => e.includes("no types"))).toBe(true);
  });

  it("passes for valid Pokemon", () => {
    const result = validatePokemon([{ id: "test", types: ["Fire"], fastMoves: [{}], chargedMoves: [{}] }]);
    expect(result.errors).toHaveLength(0);
  });
});
