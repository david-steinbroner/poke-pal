import { describe, it, expect } from "vitest";
import { matchPokemonNames } from "@/lib/pokemon-utils";

describe("matchPokemonNames", () => {
  it("matches exact names", () => {
    const result = matchPokemonNames(["Dragonite", "Venusaur"]);
    expect(result.matched).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "dragonite" }),
        expect.objectContaining({ id: "venusaur" }),
      ]),
    );
    expect(result.unmatched).toHaveLength(0);
  });

  it("matches case-insensitive", () => {
    const result = matchPokemonNames(["DRAGONITE", "venusaur", "dRaGoNiTe"]);
    expect(result.matched).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "dragonite" }),
        expect.objectContaining({ id: "venusaur" }),
      ]),
    );
    expect(result.unmatched).toHaveLength(0);
  });

  it("matches form names with parentheses", () => {
    const result = matchPokemonNames(["Giratina (Altered)"]);
    expect(result.matched).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "giratina-altered" }),
      ]),
    );
    expect(result.unmatched).toHaveLength(0);
  });

  it("reports unmatched names", () => {
    const result = matchPokemonNames(["Dragonite", "FakemonXYZ", "NotAPokemon"]);
    expect(result.matched).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "dragonite" }),
      ]),
    );
    expect(result.unmatched).toEqual(
      expect.arrayContaining(["FakemonXYZ", "NotAPokemon"]),
    );
  });

  it("deduplicates and reports dupe counts", () => {
    const result = matchPokemonNames([
      "Dragonite",
      "dragonite",
      "DRAGONITE",
    ]);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0]!.id).toBe("dragonite");
    expect(result.unmatched).toHaveLength(0);
    expect(result.dupes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dragonite", count: 3 }),
      ]),
    );
  });

  it("handles empty input", () => {
    const result = matchPokemonNames([]);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(0);
  });
});
