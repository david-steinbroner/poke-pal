import { describe, it, expect } from "vitest";
import {
  getEffectiveness,
  getSuperEffectiveTypes,
} from "@/lib/type-effectiveness";

describe("getEffectiveness", () => {
  it("returns 1.6 for fire attacking grass", () => {
    expect(getEffectiveness("Fire", ["Grass"])).toBeCloseTo(1.6);
  });

  it("returns 0.625 for fire attacking water", () => {
    expect(getEffectiveness("Fire", ["Water"])).toBeCloseTo(0.625);
  });

  it("returns 0.391 for electric attacking ground (GO immune)", () => {
    expect(getEffectiveness("Electric", ["Ground"])).toBeCloseTo(0.391);
  });

  it("multiplies for dual types: fire vs grass/steel = 1.6 * 1.6 = 2.56", () => {
    expect(getEffectiveness("Fire", ["Grass", "Steel"])).toBeCloseTo(2.56);
  });

  it("handles opposing dual types: fire vs water/rock = 0.625 * 0.625 = 0.390625", () => {
    expect(getEffectiveness("Fire", ["Water", "Rock"])).toBeCloseTo(0.390625);
  });

  it("returns 1.0 for neutral matchup", () => {
    expect(getEffectiveness("Normal", ["Fire"])).toBeCloseTo(1.0);
  });
});

describe("getSuperEffectiveTypes", () => {
  it("returns correct types for a mono-type defender", () => {
    const result = getSuperEffectiveTypes(["Dragon"]);
    expect(result).toContain("Ice");
    expect(result).toContain("Dragon");
    expect(result).toContain("Fairy");
    expect(result).not.toContain("Fire");
  });

  it("sorts by multiplier descending for dual types", () => {
    const result = getSuperEffectiveTypes(["Ground", "Dragon"]);
    const iceIndex = result.indexOf("Ice");
    const dragonIndex = result.indexOf("Dragon");
    expect(iceIndex).toBeLessThan(dragonIndex);
  });
});

