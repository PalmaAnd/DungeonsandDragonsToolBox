# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this is

**D&D Toolbox** is a Next.js web app for D&D 5e players and Dungeon Masters: character
creation, campaign management, an initiative tracker, and a suite of world-building
generators (NPCs, taverns, loot, weather, backstories, monster/materials compendia).
Everything runs client-side — no account, no backend, all state in `localStorage`,
with JSON export/import for backup/portability.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4,
Radix UI primitives, shadcn-style components in `components/ui`.

## Current state

Actively developed. The `main` branch is the stable/CI'd line (GitHub Actions CI,
dependabot keeping deps current). Work happens on feature branches — as of
2026-08-17, `feat/campaign-connectivity-data-portability` is wiring previously
isolated tools together: linking saved characters/NPCs/loot/taverns into campaigns,
connecting the Spell List and Monster Compendium into the Character Creator and
Initiative Tracker, session logging from the tracker, and a persistent
active-campaign selector in the nav.

Key structure:
- `app/` — routes: `character-creator`, `campaign-dashboard`, `monster-compendium`,
  `spell-list`, `tools` (generators hub).
- `components/` — one component per tool/generator, plus shared chrome
  (`navbar.tsx`, `mobile-nav.tsx`, `tools-sidebar.tsx`) and `ui/` primitives.
- `data/` — static game data (spells, monsters, materials, etc.) backing the
  compendia/generators.
- `hooks/`, `lib/` — localStorage persistence and shared helpers.

## End goal

**Grow this into a small open-source project**, not just a solo tool. The repo
already has the scaffolding for it (CI, CONTRIBUTING.md, issue tracker, PR
welcome badge) — lean into that rather than treating it as a private sandbox.
Practically, that means:
- Keep `main` green and mergeable; land feature branches promptly instead of
  letting them diverge for weeks.
- Prefer changes a first-time contributor could understand without deep
  context — favor the existing per-tool component structure over cleverness.
- Treat the in-progress campaign-connectivity work as the current milestone:
  finishing "every tool talks to the active campaign" is the natural v1 to
  rally contributors around.

### Ideas worth considering (unprompted, for later)
- **Import/export interop** with other tools — there's a Roll20-clone webapp
  export sitting in the parent `Projects/` folder; a shared JSON schema for
  characters/campaigns could make that (or Foundry VTT) a two-way import
  target instead of a dead end.
- **PWA/offline install** — fits the no-account, local-first model well and
  is a natural "good first issue" for a new contributor.
- **A public demo/showcase page** (GitHub Pages or the Vercel preview) linked
  from the README, since "try it now" matters more than usual for attracting
  contributors to a browser-only tool.
- **Split `data/` static datasets from app code** if they grow much further,
  so contributing new monsters/spells doesn't require touching component code.
