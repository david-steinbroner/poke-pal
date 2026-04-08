import { describe, it, expect } from "vitest";
import { assignRoles, getPokemonById } from "@/lib/team-analysis";
import type { TeamSlot } from "@/lib/team-types";
import type { PokemonType } from "@/lib/types";

function makeSlot(id: string): TeamSlot {
  const p = getPokemonById(id);
  if (!p) return null;
  return {
    pokemonId: p.id,
    name: p.name,
    types: p.types as PokemonType[],
    fastMoves: p.fastMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
    chargedMoves: p.chargedMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
  };
}

describe("assignRoles", () => {
  it("assigns lead/safe-swap/closer for a 3-Pokemon team", () => {
    const team = [
      makeSlot("medicham"),
      makeSlot("registeel"),
      makeSlot("stunfisk-galarian"),
    ];
    const roles = assignRoles(team, "great-league");
    expect(roles).toHaveLength(3);
    expect(roles.map((r) => r.role).sort()).toEqual([
      "closer",
      "lead",
      "safe-swap",
    ]);
    roles.forEach((r) => {
      expect(r.reasoning).toBeTruthy();
      expect(r.pokemonId).toBeTruthy();
    });
  });

  it("assigns only lead for a 1-Pokemon team", () => {
    const team = [makeSlot("medicham"), null, null];
    const roles = assignRoles(team, "great-league");
    expect(roles).toHaveLength(1);
    expect(roles[0]!.role).toBe("lead");
  });

  it("assigns lead and safe-swap for 2 Pokemon", () => {
    const team = [makeSlot("registeel"), makeSlot("altaria"), null];
    const roles = assignRoles(team, "great-league");
    expect(roles).toHaveLength(2);
    const roleNames = roles.map((r) => r.role);
    expect(roleNames).toContain("lead");
    expect(roleNames).toContain("safe-swap");
  });

  it("returns empty array for empty team", () => {
    const roles = assignRoles([null, null, null], "great-league");
    expect(roles).toHaveLength(0);
  });

  it("generates meaningful reasoning strings", () => {
    const team = [
      makeSlot("medicham"),
      makeSlot("registeel"),
      makeSlot("stunfisk-galarian"),
    ];
    const roles = assignRoles(team, "great-league");
    const lead = roles.find((r) => r.role === "lead");
    const swap = roles.find((r) => r.role === "safe-swap");
    const closer = roles.find((r) => r.role === "closer");

    expect(lead!.reasoning).toMatch(/covers|lead/i);
    expect(swap!.reasoning).toMatch(/covers|gaps/i);
    expect(closer!.reasoning).toMatch(/rounds out|coverage/i);
  });
});
