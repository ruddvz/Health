# Changelog

## Unreleased

### Audit Definition of Done closeout

- **Onboarding refactor:** `OnboardingFlow`, `StepAbout`–`StepLifestyle`, `ReviewImportSheet`, shared `onboarding-form.css`.
- **Progress no-plan:** `EmptyState` + import/sample CTAs while logging remains available.
- **Import:** confirm before replacing an existing on-device plan.
- **iOS PWA:** `apple-touch-icon.png` (180×180), manifest + layout links.
- **E2E:** delete-all-local-data flow; expanded no-plan/screenshot routes; SW verify includes train/progress/system.
- **Release QA note:** `docs/RELEASE_QA.md` (automated gate + manual iPhone checklist).

### Master plan final polish

- **Toast** host for lightweight in-app feedback; **ScreenHeader** and **MetricCard** shell primitives.
- **BottomSheet** for Progress check-in, Meals add-meal, and Grocery add-item (theme-aware `inp-shell` inputs).
- **Grocery:** local custom items via `groceryExtras` in progress store.
- **Diagnostics:** export validation report JSON.
- E2E: corrupted plan storage recovery banner.

### Master plan completion pass

- **RequiresPlan** empty states on System → Phases, Grocery, Prep, Supplements, and Train session (no more silent redirect to Import).
- **Progress:** export JSON on tab, delete weight/check-in entries, safe trend insight copy.
- **Debounced local writes** for progress, onboarding, and settings (`healthApp.ts`).
- **Cloud API:** `POST /api/health/logout`, `DELETE /api/health/backup`, session tokens stored as SHA-256 hashes server-side.
- **Responsive shell:** centered phone column with tablet/desktop borders; docs copy of `HEALTH_REPO_MASTER_FIX_PLAN.md`.
- Tests: meal-schedule validation, quick-fix presets, system phases no-plan e2e.

### Product completion (audit pass)

- **Storage recovery banner** when saved plan JSON cannot parse (`planParseError` store).
- **Vault migration** backup + rollback if encryption fails mid-migration.
- **README** honest status matrix; removed contradictory “shell only” limitation.
- **CI** workflow: `npm run quality` on PRs; Playwright e2e with browser install.
- Docs: `SCHEMA_V2.md`, `PRIVACY_MODEL.md`, `IOS_PWA_QA.md`, `LEGACY_PARITY.md`.

### iOS PWA polish and no-plan UX (continued)

- **Structured validation** (`ValidationIssue` with codes, paths, fix hints) and expanded safety checks (allergies, meds+supplements, unsafe calories, schedule/meal times, duplicate phase ids).
- **Import preview** — Review pasted/uploaded JSON before Apply; health disclaimer on import screen.
- **`BottomSheet`** component; import paste uses shared sheet.
- **System hub** — live PWA version, standalone status, service worker status, storage estimate.
- **Privacy** page includes health disclaimer card.
- **API:** JSON body size cap (256 KB), per-route rate limits, production fail-closed validation for blocking issues.
- **Playwright** screenshot regression (`npm run test:e2e:screenshots`) for mobile + iPhone-width viewports.
- Docs: iOS PWA QA section, passkey API security notes.

### iOS PWA polish and no-plan UX

- **Welcome launcher** on `/` before intake — create prompt, import JSON, demo sample plan, privacy copy, continue draft.
- **No-plan empty states** on Today, Meals, Train, Progress (logging without plan), and Diagnostics (no false “schema parses”).
- **Sample plan** loader from Import and welcome (`static/samples/rudra-plan-v2.json`).
- **iOS PWA metadata** in `app.html`, manifest shortcuts, iOS semantic color tokens, reduced-motion CSS.
- **About** page: PWA/standalone status, service worker status, cache refresh helper, iPhone install steps.
- **Cloud API hardening**: CORS allowlist (`HEALTH_ALLOWED_ORIGINS`), production fail-closed without Supabase unless `HEALTH_ALLOW_MEMORY_STORE=true`.
- **`quality` / `quality:e2e`** npm scripts; Playwright coverage for no-plan routes.
- Reusable `EmptyState`, `NoPlanActions`, `WelcomeLauncher` components.

### Health Lock (local passkey app lock)

- **Phase 1**: WebAuthn platform passkey / Face ID / Touch ID app lock for the static GitHub Pages PWA — no backend, data stays on device.
- Post-import **Protect your health plan** sheet; **Unlock Health** gate on app routes; **System → Security** for passkey, recovery PIN, recovery codes, auto-lock, remove passkey.
- **AES-GCM encrypted vault** in IndexedDB for plan/progress/onboarding/settings when lock is enabled (recovery PIN required).
- PIN attempt rate limiting; lock on tab hide / `pagehide`; GitHub Pages relying-party domain guidance.
- See `docs/HEALTH_PASSKEY_SECURITY_IMPLEMENTATION.md` for Phase 2 (custom domain) and Phase 3 (server passkeys).

### SvelteKit rebuild (Phase 1)

- Scaffold SvelteKit (TypeScript), `@sveltejs/adapter-static` with `build/` output and GitHub Pages base `/Health`, `vite-plugin-pwa` with Workbox precache, Nothing OS–inspired design tokens and shell (bottom nav, status strip, offline banner, install/update prompts).
- Move the previous root single-file app into `legacy/` for archival reference; GitHub Actions now deploy the Vite build output instead of the repo root.
- Add `docs/HEALTH_APP_REBUILD_PLAN.md` as the authoritative rebuild specification.

### Legacy single-file app (merged snapshot in `legacy/`)

#### Added

- **normalizePlanV1ToV2** on ingest/save: bumps `plan_schema_version`, fills `schedule.meal_times` and protein `daily_totals` when derivable.
- **Today**: schedule-sorted timeline, macro strip vs phase, Sunday prep / Monday check-in reminders, smarter “up next” meal from clock order.
- **Meals**: **Cook mode** overlay (ingredient checkboxes, steps from description, 5/10/15 min timers), **Swaps** when JSON includes `swaps`, optional **backup / emergency** meals when listed.
- **Training**: on-device **rest countdown** (60/90/120s) when `weekly_split` exists.
- **Progress**: waist logging, weekly check-in notes, soft **Insights** from recent logs.
- **Intake**: allergies field + medication/condition checkbox; prompt profile includes them.
- **More → Appearance**: **Light mode** toggle (`localStorage`).
- Sample `samples/rudra-plan-v2-normalized.json`; **validatePlan** rejects duplicate phase ids.
- Five-tab navigation: **Today**, **Meals**, **Training**, **Progress**, and **More** (phases, prep, grocery, supplements live under More).
- **Training** tab rendering `training.weekly_split` when present; helpful fallback when only `training_note` exists.
- **Progress** tab with local weight log and JSON export from the More hub.
- **Macro repair** suggestions on the Meals tab when calories or protein fall meaningfully below phase targets.
- **Schema v2 enrichment**: `enrichPlanForApp` fills missing `daily_totals` from meal kcal sums, adds default `schedule` and `safety` blocks; `meta.plan_schema_version` set to 2 on save.
- Expanded **validatePlanWarnings** (protein gaps, water >4L, training program missing, supplement safety hint).
- **Intake**: optional wake / sleep / training clock fields; **Skip to JSON** shortcut; prompt screen **paste JSON** flow.
- **PWA**: service worker `health-v10` with `skipWaiting`, network-first navigation, cache update of `index.html`, stale-cache cleanup; in-app **refresh** snackbar when a new SW is waiting.
- Sample plan: `samples/minimal-plan-v2.json`.
- Docs: `docs/QA_CHECKLIST.md` for manual regression checks.

#### Changed

- Claude **buildPrompt** appends explicit schema v2 / safety instructions.
- **Supplement** copy passes through cautious wording helper for several harsh phrases.
- **Grocery** tab shows a standing disclaimer that prices are estimates.
- **Prep** tab includes a short **food safety** reminder card.

#### Fixed

- Progress log button wiring uses a static form (no duplicate listeners on tab revisit).
