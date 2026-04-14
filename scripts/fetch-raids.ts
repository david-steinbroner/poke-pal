/**
 * Fetch current Pokemon GO raid bosses from LeekDuck and write to
 * src/data/current-raids.json.
 *
 * Run: npx tsx scripts/fetch-raids.ts
 *
 * TODO(automation): wire this to a GitHub Action on a daily cron so the
 * deployed site auto-refreshes without a manual run. Draft workflow:
 *   on: schedule: [{ cron: '0 14 * * *' }]  # 14:00 UTC daily
 *   steps: checkout → npm ci → npm run update:raids → commit & push
 *
 * Dynamax: LeekDuck doesn't expose a stable listing page yet; dynamax[] is
 * left empty and must be curated manually until a source is available.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_URL = "https://leekduck.com/raid-bosses/";
const OUT = join(process.cwd(), "src/data/current-raids.json");
const POKEMON = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/pokemon.json"), "utf-8"),
) as { id: string; name: string }[];

type Tier = 1 | 3 | 5 | "mega";
type Boss = { id: string; tier: Tier; shadow: boolean };

/** Strip "Mega "/"Shadow " prefixes and convert "Alolan X" → "x-alolan" etc. */
function nameToId(raw: string): string | null {
  let name = raw.trim().replace(/^Mega\s+/i, "").replace(/^Shadow\s+/i, "");
  const formPrefixes = ["Alolan", "Galarian", "Hisuian", "Paldean"];
  let formSuffix = "";
  for (const form of formPrefixes) {
    const re = new RegExp(`^${form}\\s+`, "i");
    if (re.test(name)) {
      name = name.replace(re, "");
      formSuffix = `-${form.toLowerCase()}`;
      break;
    }
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const candidates = [
    `${slug}${formSuffix}`,
    slug, // fallback for names our data doesn't split by form
  ];
  for (const c of candidates) {
    if (POKEMON.some((p) => p.id === c)) return c;
  }
  return null;
}

/** Parse a <div class="...raid-bosses"> block into {tier, shadow, names[]} tier groups. */
function parseSection(html: string, shadow: boolean): Boss[] {
  const bosses: Boss[] = [];
  // Split by tier header: <h2 ... data-tier="X">
  const tierRegex = /data-tier="([^"]+)"/g;
  const matches = [...html.matchAll(tierRegex)];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    const next = matches[i + 1];
    const tierRaw = match[1]!;
    const start = match.index! + match[0].length;
    const end = next ? next.index! : html.length;
    const block = html.slice(start, end);
    const tier: Tier | null =
      tierRaw === "1" ? 1 :
      tierRaw === "3" ? 3 :
      tierRaw === "5" ? 5 :
      tierRaw === "Mega" ? "mega" :
      null;
    if (tier === null) {
      console.warn(`[fetch-raids] Unknown tier: ${tierRaw}`);
      continue;
    }
    const names = [...block.matchAll(/<p class="name[^"]*">([^<]+)<\/p>/g)].map((m) =>
      (m[1] ?? "").trim(),
    ).filter(Boolean);
    for (const name of names) {
      let id = nameToId(name);
      if (!id) {
        console.warn(`[fetch-raids] Unmatched boss name: "${name}" (tier ${tierRaw})`);
        continue;
      }
      // Prefer -shadow form for shadow bosses if it exists in pokemon.json
      if (shadow) {
        const shadowId = `${id}-shadow`;
        if (POKEMON.some((p) => p.id === shadowId)) id = shadowId;
      }
      // Prefer -mega form for mega bosses if it exists
      if (tier === "mega") {
        const megaId = `${id}-mega`;
        if (POKEMON.some((p) => p.id === megaId)) id = megaId;
      }
      bosses.push({ id, tier, shadow });
    }
  }
  return bosses;
}

async function main() {
  console.log(`[fetch-raids] Fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const regularMatch = html.match(
    /<div class="raid-bosses"[^>]*>([\s\S]*?)<div class="shadow-raid-bosses"/,
  );
  const shadowMatch = html.match(
    /<div class="shadow-raid-bosses"[^>]*>([\s\S]*?)<\/article>/,
  );
  if (!regularMatch) throw new Error("Could not find regular raid section");

  const regular = parseSection(regularMatch[1] ?? "", false);
  const shadow = shadowMatch ? parseSection(shadowMatch[1] ?? "", true) : [];
  const all = [...regular, ...shadow];

  // Legacy-compatible shape used by src/app/page.tsx + richer `bosses` list.
  const out = {
    lastUpdated: new Date().toISOString().slice(0, 10),
    source: SOURCE_URL,
    bosses: all,
    // Legacy arrays (non-shadow only for tier keys; shadow[] holds all shadows).
    onestar: regular.filter((b) => b.tier === 1).map((b) => b.id),
    threestar: regular.filter((b) => b.tier === 3).map((b) => b.id),
    fivestar: regular.filter((b) => b.tier === 5).map((b) => b.id),
    mega: regular.filter((b) => b.tier === "mega").map((b) => b.id),
    shadow: shadow.map((b) => b.id),
    dynamax: [] as string[], // TODO: no LeekDuck source yet
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `[fetch-raids] Wrote ${OUT}\n` +
      `  ${out.onestar.length} × 1★, ${out.threestar.length} × 3★, ${out.fivestar.length} × 5★, ` +
      `${out.mega.length} mega, ${out.shadow.length} shadow`,
  );
}

main().catch((err) => {
  console.error("[fetch-raids] Failed:", err);
  process.exit(1);
});
