# UI Audit Baseline — 2026-06-05

## Stack

- SvelteKit + TypeScript, adapter-static, Vite PWA, Playwright, Vitest
- Routes: `/`, `/import`, `/today`, `/meals`, `/train`, `/progress`, `/system` (+ subflows)

## Pre-redesign issues

1. Nothing OS dark/red theme dominates; not iOS wellness premium
2. `TopStatusBar` shows `WEEK — · WORKOUT DAY` without plan context
3. Bottom nav is flat dark bar, not floating glass pill
4. Settings rows use text abbreviations (`KEY`, `LOCK`, `OUT`, `DEL`)
5. Body max-width 430px on all viewports — desktop looks like stretched phone
6. Progress shows `0%` adherence when no data (confusing)
7. Home/onboarding copy is JSON-first and document-like

## Baseline quality (main @ pre-redesign)

- `npm run check` — pass (7 CSS warnings)
- `npm run lint` — pass
- `npm test` — 55 tests pass
- Build/e2e run after redesign per phase

## Files targeted

- `src/lib/styles/*`
- `src/lib/components/app/*`, `src/lib/components/ui/*`
- `src/routes/+layout.svelte`, all main route pages
- `src/lib/components/security/*`
- `e2e/*.spec.ts`
