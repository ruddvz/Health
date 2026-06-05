# Manual QA checklist (Health PWA)

Use after substantive UI or storage changes.

## Automated smoke (CI)

Playwright covers a subset of this list (`npm run test:e2e` after build):

- Intake first step visible (`e2e/intake-smoke.spec.ts`)
- Settings appearance + System Phases link (`e2e/system-followups.spec.ts`)
- Today quick nav + privacy card; Phases drill-down (`e2e/plan-flow.spec.ts`)
- Import paste invalid JSON error in modal (`e2e/import-paste.spec.ts`)
- Passkey offer “Not now” → Today (`e2e/passkey-offer.spec.ts`)
- Progress JSON export section in Settings (`e2e/progress-export.spec.ts`)

- No-plan empty states (`e2e/no-plan-states.spec.ts`) — Today, Meals, Train, Progress, Diagnostics, Phases, Grocery, Prep, Supplements
- Corrupted plan storage recovery banner (`e2e/storage-recovery.spec.ts`)
- Import: paste → **Review** → **Apply plan** (`e2e/helpers/importPlan.ts`)

Visual regression (optional, updates baselines): `npm run test:e2e:screenshots`

Manual checks below remain required for HTTPS passkeys, service worker updates, and cloud backup.

## iOS PWA

Test on a real iPhone in **Safari** (install flow is not available in desktop Chrome alone).

- [ ] Open `https://ruddvz.github.io/Health/` in Safari.
- [ ] **Share → Add to Home Screen** — icon and name look correct.
- [ ] Launch from home screen — runs standalone (no Safari URL bar); status bar does not cover content (`viewport-fit=cover`).
- [ ] Bottom tab bar does not cover primary buttons or sheet footers; content scrolls above nav safe area.
- [ ] Keyboard does not permanently hide the active input on intake/import.
- [ ] After first online visit, airplane mode still opens shell + last plan (offline).
- [ ] After deploy: update snackbar or **System → About → Clear app cache and reload** refreshes assets.
- [ ] **Appearance** light mode: readable contrast on cards, inputs, warnings (Settings).
- [ ] Passkey / Face ID: only on **HTTPS** production origin (not `file://`).

## Navigation

- [ ] Bottom tabs: Today, Meals, Training, Progress, More all open the correct panel.
- [ ] From **More**, open Phases / Prep / Grocery / Supplements **with no plan** — each shows setup CTAs (not a blank page or silent redirect).
- [ ] From **More**, open Phases / Prep / Grocery / Supplements **with a plan**; **← More menu** returns to the hub.
- [ ] **Quick navigation** cards on Today still jump to the correct More sub-views.

## Intake & prompt

- [ ] Complete intake and generate prompt; optional schedule times appear in copied JSON profile.
- [ ] **Skip to JSON** opens the prompt screen without completing intake.
- [ ] **Paste JSON** → **Review** → preview card → **Apply plan**; malformed JSON shows an error in the sheet.

## Plan load

- [ ] File upload still works; **>2 MB** file is rejected with a clear message.
- [ ] `samples/minimal-plan-v2.json` uploads and shows Training + Meals + Prep.

## Today / Meals

- [ ] **Up next** hero card shows the first meal of the day type.
- [ ] **Plan checks** warnings appear when the sample plan has intentional gaps (or remove warnings when aligned).

## Progress

- [ ] Log a weight; list updates; **Export progress JSON** from More downloads data.

## Service worker

- [ ] Bump `CACHE` in `sw.js`, reload twice; update snackbar appears; **Refresh** loads new assets.

## Data

- [ ] **Delete all local data** clears plan, progress list, and returns to intake.

## Health Lock (passkey / Face ID)

Test on **HTTPS** — use production when possible: `https://ruddvz.github.io/Health/` (passkeys bind to this origin; localhost is dev-only).

- [ ] Import plan → **Protect your health plan** sheet appears → **Protect with passkey** requires recovery PIN → recovery codes shown once.
- [ ] **Not now** skips lock and opens Today.
- [ ] With lock on: open **Today** → **Unlock Health** → **Unlock with passkey** works on device with biometrics.
- [ ] After passkey unlock on cold start with encryption: enter **recovery PIN** to load plan data.
- [ ] Wrong PIN 5+ times → temporary lockout message.
- [ ] **System → Security**: generate recovery codes, change recovery PIN, **Lock now**, **Remove passkey from this device**.
- [ ] Recovery code unlock works (one-time).
- [ ] Switch apps / background → auto-lock when set to “immediately when hidden”.
- [ ] **Delete all local data** clears lock + encrypted vault.

## Cloud passkey (Phase 3 — Vercel + Supabase)

- [ ] `GET {PUBLIC_HEALTH_API_URL}/api/health/status` returns `{ ok: true }`.
- [ ] Security → create cloud passkey → sign out → sign in.
- [ ] Upload / download encrypted cloud backup with backup password.
