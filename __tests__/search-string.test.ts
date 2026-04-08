import { describe, it, expect } from "vitest";
import {
  buildTypeSearchString,
  buildNameSearchString,
  buildLeagueEligibleString,
} from "@/lib/search-string";

describe("buildTypeSearchString", () => {
  it("joins types with commas using @1 prefix", () => {
    expect(buildTypeSearchString(["Dark", "Dragon", "Fairy"])).toBe(
      "@1dark,@1dragon,@1fairy"
    );
  });

  it("lowercases type names", () => {
    expect(buildTypeSearchString(["Fire"])).toBe("@1fire");
  });

  it("returns empty string for empty array", () => {
    expect(buildTypeSearchString([])).toBe("");
  });
});

describe("buildNameSearchString", () => {
  it("joins Pokemon names with commas", () => {
    expect(buildNameSearchString(["Garchomp", "Rayquaza", "Salamence"])).toBe(
      "garchomp,rayquaza,salamence"
    );
  });
});

describe("buildLeagueEligibleString", () => {
  it("builds CP cap string for Great League", () => {
    expect(buildLeagueEligibleString(1500)).toBe("cp-1500");
  });

  it("builds CP cap string for Ultra League", () => {
    expect(buildLeagueEligibleString(2500)).toBe("cp-2500");
  });
});
