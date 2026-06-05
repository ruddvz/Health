# UI Audit Baseline — iOS 26 Redesign

**Date:** 2026-06-05  
**Branch:** `cursor/ios26-pixel-perfect-ui-13df`  
**Plan:** HEALTH_IOS26_PIXEL_PERFECT_UI_UX_AGENT_PLAN

## Pre-redesign issues (resolved)

1. Light/warm wellness theme did not match iOS 26 graphite + lime direction
2. `TopStatusBar` showed noisy all-caps `WEEK — · WORKOUT DAY` without plan context
3. Bottom nav used flat dark bar / red active state instead of floating glass + lime accent
4. Settings rows used cryptic abbreviations
5. Desktop layout capped at phone width on some screens
6. Progress showed confusing `0%` adherence when no data
7. Home/onboarding copy was JSON-first

## Redesign deliverables

### Phase 1 — Tokens & global styles

- `src/lib/styles/tokens.css` — full iOS 26 token set (dark default, light via `[data-theme="light"]`)
- `src/lib/styles/global.css` — layered background, card/hero/glass primitives
- `src/lib/styles/utilities.css` — page layout, inputs, metric grid, skeleton

### Phase 2 — Shell

- `AppShell.svelte` — mobile column + desktop grid (88px / 248px rail)
- `BottomTabBar.svelte` — floating glass pill nav, lime active state, left rail ≥768px
- `TopStatusBar.svelte` — sticky glass status with Local + Lock

### Phase 3 — Primitives

- `HealthButton`, `RedActionButton`, `SecondaryButton`, `SegmentedControl`
- `MetricTile`, `ScreenHeaderBlock`, `ListRowButton`, `NextActionCard`
- `ToastHost`, `BottomSheet`, `EmptyState`, chips, settings rows, security UI

### Phase 4–9 — Screens

- Welcome launcher, import flow, Today, Meals, Train, Progress, System + subviews

### Phase 10 — PWA & QA

- Viewport/safe-area meta verified in `src/app.html`
- Theme color synced in `theme.ts`
- Quality commands run before PR

## Viewport test matrix

| Width | Device class             | Status                        |
| ----: | ------------------------ | ----------------------------- |
|   375 | iPhone SE                | Layout tokens + page-x 16px   |
|   390 | Standard iPhone          | Default page-x 18px           |
|   393 | Pro Safari               | Same as 390                   |
|   430 | Pro Max                  | page-x 20px, nav margins 18px |
|   768 | iPad                     | Left rail 88px                |
|  1024 | iPad landscape / desktop | Expanded rail 248px           |
|  1280 | Desktop                  | max-width 1180px content      |

## Quality baseline

```bash
npm run check
npm run lint
npm test
npm run build
npm run verify:sw
npm run test:e2e
npm run test:e2e:screenshots
```

## Notes

- Dark mode is default; light mode uses `[data-theme="light"]`
- Legacy `--health-*` and `--text-*` aliases map to new `--h-*` tokens for gradual migration
- Red reserved for destructive/error; lime accent for primary actions
