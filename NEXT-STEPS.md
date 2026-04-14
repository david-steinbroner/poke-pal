# Poke Pal — Pickup Instructions

Last session: 2026-04-14. Version: 1.7.1.

## What's next

1. **Refresh raid data before each session:** `npm run update:raids` (scrapes leekduck.com, writes `src/data/current-raids.json`).
2. **Automate raid refresh** — write a GitHub Action on daily cron that runs `update:raids`, commits the JSON, and redeploys. Sketch in header of `scripts/fetch-raids.ts`.
3. **Dynamax raids** — no scraper source yet. Either find one or wire a manual-entry path.
4. **Separate `/raids` tab** — offhand request, not specced yet.
5. **Clean up `pokemon.json`** — drop the `"None"` placeholder second type on single-type rows so future bugs don't trip on it (spot-fixed in `getEffectiveness` already, but the data is still dirty).
6. **Optional nested sticky** (Rockets encounter cards / sub-sections) — deferred; would need ladder-style `top:` offsets to avoid three levels fighting over the same stick line.

---

## Quick Resume (for continuing scans)

```bash
cd ~/Projects/Pokemon\ GO/poke-pal/skill
source .venv/bin/activate

# Position your Pokemon storage grid so the next unscanned Pokemon is at row 1, col 1
# Then run:
python3 scripts/scanner.py scan --output ~/Projects/Pokemon\ GO/poke-pal/scans/<batch-name> --limit 30
```

After scanning, tell Claude: "Process and load the batch at `scans/<batch-name>`"

---

## Full Setup (first time or after long break)

### Step 1: Prerequisites

Python deps are installed in venv at `skill/.venv/`. Activate with:
```bash
cd ~/Projects/Pokemon\ GO/poke-pal/skill && source .venv/bin/activate
```

macOS permissions needed (System Settings > Privacy & Security):
- **Screen Recording** — Terminal
- **Accessibility** — Terminal

### Step 2: iPhone Mirroring Setup

1. Open iPhone Mirroring on Mac
2. Open Pokemon GO > Pokemon storage
3. Sort A-Z (or however you want — stay consistent)
4. Place Terminal and iPhone Mirroring side by side

### Step 3: Calibrate (7 steps)

```bash
python3 scripts/scanner.py calibrate
```

Records: window bounds, grid positions (3 Pokemon), detail screen buttons (X, hamburger), detail scroll gesture (up + down), appraisal buttons, storage scroll gesture, focus tap location.

Saves to `~/.pogo-scanner/calibration.json`. Recalibrate if window moves.

### Step 4: Test

```bash
# Verify calibrated positions land correctly
python3 scripts/scanner.py test

# Test scan 3 Pokemon
python3 scripts/scanner.py scan --output ~/Projects/Pokemon\ GO/poke-pal/scans/test --limit 3
```

### Step 5: Scan in batches of 30

```bash
python3 scripts/scanner.py scan --output ~/Projects/Pokemon\ GO/poke-pal/scans/batch-name --limit 30
```

- Scanner captures 3 Retina 2x screenshots per Pokemon (summary, moves, appraisal)
- Normal speed: ~10s per Pokemon, 30 Pokemon = ~5 minutes
- Emergency stop: press Escape or move mouse to any screen corner
- After first Pokemon, pauses for verification
- Drift check every 105 Pokemon

### Step 6: Process screenshots (hybrid IV pipeline)

Tell Claude to process. The pipeline:
1. Claude reads summary_top + moves screenshots (species, CP, HP, moves, power-up cost, star rating)
2. `iv_calculator.py` calculates IVs locally from CP+HP+species+level+stars (~50ms each)
3. If multiple IV candidates, appraisal bar at 2x resolution disambiguates
4. Results inserted into D1 database

Cost: ~$0.001-0.003 per Pokemon via API.

### Step 7: Resume scanning

On resume, the scanner skips auto-scrolling — position the grid yourself so the next Pokemon is at row 1, column 1.

```bash
python3 scripts/scanner.py scan --output ~/Projects/Pokemon\ GO/poke-pal/scans/batch-name --resume --limit 30
```

---

## Current Progress

- **146 Pokemon in D1** (116 fully scanned, 30 old entries)
- **~800 remaining** out of ~920 total
- Scanned: Abra through Caterpie (Dynamax) alphabetically
- D1 database: `5ac3ad74-a8d8-4ac6-8a69-ba1c510ea5fd`
- Web UI: https://poke-pal.davidsteinbroner.workers.dev

## File Locations

| What | Where |
|------|-------|
| Scanner | `skill/scripts/scanner.py` |
| IV Calculator | `skill/scripts/iv_calculator.py` |
| Batch Processor | `skill/scripts/process_batch.py` |
| Base Stats (1710 Pokemon) | `skill/data/base_stats.json` |
| IV Bar Guide | `skill/references/iv-bar-guide.md` |
| Scan Output | `scans/` (batches stored here) |
| Calibration | `~/.pogo-scanner/calibration.json` |
| Web UI | `web/` (Cloudflare Workers) |
| Skill Definition | `skill/SKILL.md` |
| Tests | `skill/tests/test_scanner.py` |
| Venv | `skill/.venv/` |
