import { describe, it, expect } from "vitest";
import { getCountersFor } from "@/lib/counters";

describe("getCountersFor", () => {
  it("returns top and budget counters for a Pokemon ID", () => {
    const result = getCountersFor("giratina-altered");
    expect(result.topCounters.length).toBeGreaterThan(0);
    expect(result.topCounters.length).toBeLessThanOrEqual(5);
    expect(result.budgetCounters.length).toBeGreaterThanOrEqual(0);
  });

  it("returns counters with required fields", () => {
    const result = getCountersFor("giratina-altered");
    const counter = result.topCounters[0];
    expect(counter).toBeDefined();
    expect(counter!.pokemon).toBeTruthy();
    expect(counter!.fastMove).toBeTruthy();
    expect(counter!.chargedMoves.length).toBeGreaterThan(0);
    expect(counter!.tier).toBe("top");
  });

  it("returns search string for the counters", () => {
    const result = getCountersFor("giratina-altered");
    expect(result.searchString).toContain("@1");
  });

  it("returns empty result for unknown Pokemon", () => {
    const result = getCountersFor("nonexistent-pokemon");
    expect(result.topCounters).toEqual([]);
    expect(result.searchString).toBe("");
  });
});
