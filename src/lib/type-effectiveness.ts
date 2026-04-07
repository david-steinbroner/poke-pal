import { type PokemonType, POKEMON_TYPES } from "./types";

// Pokemon GO specific multipliers
const SE = 1.6;    // Super effective
const NE = 1.0;    // Neutral
const NVE = 0.625; // Not very effective
const IMM = 0.391; // Immune (in GO, still does reduced damage)

// Full type effectiveness chart: CHART[attacker][defender] = multiplier
const CHART: Record<PokemonType, Record<PokemonType, number>> = {
  Normal:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NVE, Ghost: IMM, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Fire:     { Normal: NE, Fire: NVE, Water: NVE, Electric: NE, Grass: SE, Ice: SE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: SE, Rock: NVE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: SE, Fairy: NE },
  Water:    { Normal: NE, Fire: SE, Water: NVE, Electric: NE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NE, Ground: SE, Flying: NE, Psychic: NE, Bug: NE, Rock: SE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NE, Fairy: NE },
  Electric: { Normal: NE, Fire: NE, Water: SE, Electric: NVE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NE, Ground: IMM, Flying: SE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NVE, Fairy: NE },
  Grass:    { Normal: NE, Fire: NVE, Water: SE, Electric: NE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NVE, Ground: SE, Flying: NVE, Psychic: NE, Bug: NVE, Rock: SE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NVE, Fairy: NE },
  Ice:      { Normal: NE, Fire: NVE, Water: NVE, Electric: NE, Grass: SE, Ice: NVE, Fighting: NE, Poison: NE, Ground: SE, Flying: SE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: NE, Steel: NVE, Fairy: NE },
  Fighting: { Normal: SE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: SE, Fighting: NE, Poison: NVE, Ground: NE, Flying: NVE, Psychic: NVE, Bug: NVE, Rock: SE, Ghost: IMM, Dragon: NE, Dark: SE, Steel: SE, Fairy: NVE },
  Poison:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: SE, Ice: NE, Fighting: NE, Poison: NVE, Ground: NVE, Flying: NE, Psychic: NE, Bug: NE, Rock: NVE, Ghost: NVE, Dragon: NE, Dark: NE, Steel: IMM, Fairy: SE },
  Ground:   { Normal: NE, Fire: SE, Water: NE, Electric: SE, Grass: NVE, Ice: NE, Fighting: NE, Poison: SE, Ground: NE, Flying: IMM, Psychic: NE, Bug: NVE, Rock: SE, Ghost: NE, Dragon: NE, Dark: NE, Steel: SE, Fairy: NE },
  Flying:   { Normal: NE, Fire: NE, Water: NE, Electric: NVE, Grass: SE, Ice: NE, Fighting: SE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: SE, Rock: NVE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Psychic:  { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: SE, Poison: SE, Ground: NE, Flying: NE, Psychic: NVE, Bug: NE, Rock: NE, Ghost: NE, Dragon: NE, Dark: IMM, Steel: NVE, Fairy: NE },
  Bug:      { Normal: NE, Fire: NVE, Water: NE, Electric: NE, Grass: SE, Ice: NE, Fighting: NVE, Poison: NVE, Ground: NE, Flying: NVE, Psychic: SE, Bug: NE, Rock: NE, Ghost: NVE, Dragon: NE, Dark: SE, Steel: NVE, Fairy: NVE },
  Rock:     { Normal: NE, Fire: SE, Water: NE, Electric: NE, Grass: NE, Ice: SE, Fighting: NVE, Poison: NE, Ground: NVE, Flying: SE, Psychic: NE, Bug: SE, Rock: NE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Ghost:    { Normal: IMM, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: SE, Bug: NE, Rock: NE, Ghost: SE, Dragon: NE, Dark: NVE, Steel: NE, Fairy: NE },
  Dragon:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: NE, Steel: NVE, Fairy: IMM },
  Dark:     { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NVE, Poison: NE, Ground: NE, Flying: NE, Psychic: SE, Bug: NE, Rock: NE, Ghost: SE, Dragon: NE, Dark: NVE, Steel: NVE, Fairy: NVE },
  Steel:    { Normal: NE, Fire: NVE, Water: NVE, Electric: NVE, Grass: NE, Ice: SE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: SE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: SE },
  Fairy:    { Normal: NE, Fire: NVE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: SE, Poison: NVE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: SE, Steel: NVE, Fairy: NE },
};

/**
 * Calculate the type effectiveness multiplier for an attack type against defender types.
 * Multiplies individual matchups for dual-type defenders.
 */
export function getEffectiveness(
  attackType: PokemonType,
  defenderTypes: PokemonType[],
): number {
  let multiplier = 1.0;
  for (const defType of defenderTypes) {
    multiplier *= CHART[attackType][defType];
  }
  return multiplier;
}

/**
 * Returns all attack types that are super effective (>1.0x) against the given defender types,
 * sorted by multiplier descending (strongest counters first).
 */
export function getSuperEffectiveTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  return POKEMON_TYPES
    .filter((atkType) => getEffectiveness(atkType, defenderTypes) > 1.0)
    .sort(
      (a, b) =>
        getEffectiveness(b, defenderTypes) - getEffectiveness(a, defenderTypes),
    );
}

/**
 * Returns all attack types that the defender resists (<1.0x multiplier).
 */
export function getResistantTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  return POKEMON_TYPES.filter(
    (atkType) => getEffectiveness(atkType, defenderTypes) < 1.0,
  );
}

/**
 * Returns the types that the defender's own type(s) hit super effectively.
 * Useful for knowing what the defender threatens offensively.
 */
export function getWeakToTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  const dangerous: PokemonType[] = [];
  for (const defType of defenderTypes) {
    for (const targetType of POKEMON_TYPES) {
      if (CHART[defType][targetType] > 1.0 && !dangerous.includes(targetType)) {
        dangerous.push(targetType);
      }
    }
  }
  return dangerous;
}
