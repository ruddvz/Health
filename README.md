# Health — Personal Plan

Health is a **local-first PWA** that turns a structured JSON health plan into an interactive daily dashboard (Today, Meals, Train, Progress, System).

The production app is a **SvelteKit + TypeScript** build deployed to GitHub Pages at [https://ruddvz.github.io/Health/](https://ruddvz.github.io/Health/). The earlier single-file app is preserved under **`legacy/`** for reference.

## Implementation status

| Area                                         | Status                                                               |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Welcome + 6-step intake                      | **Complete** — autosave, validation, skip to import                  |
| Import / paste JSON                          | **Complete** — preview, size limit, validation summary               |
| No-plan empty states                         | **Complete** — Today, Meals, Train, Progress, System subroutes       |
| Plan-driven Today / Meals / Train / Progress | **Complete** — macros, timeline, cook mode, training, logs           |
| Health Lock (local passkey + vault)          | **Complete** — optional; recovery PIN required                       |
| Cloud passkey / backup                       | **Partial** — UI gated; needs Vercel API + Supabase env              |
| iOS PWA polish                               | **Partial** — manifest, safe-area, install prompt; device QA ongoing |
| Onboarding component split                   | **Not yet** — root `+page.svelte` still large (refactor planned)     |

## What the legacy app included

See `legacy/index.html` and `docs/LEGACY_PARITY.md` for the pre-SvelteKit feature matrix.

## Sample JSON

- `samples/minimal-plan-v2.json` — small valid plan for smoke tests
- `samples/rudra-plan-v2-normalized.json` — richer schema v2 example
- `static/samples/rudra-plan-v2.json` — bundled demo (Import or welcome **Load sample plan**)

## Tech & privacy

- **Production:** static PWA, base path **`/Health`**, data in **localStorage** / **IndexedDB** (encrypted when Health Lock is on)
- **No account required** by default; optional cloud backup only when backend is configured
- Roadmaps: `docs/HEALTH_APP_REBUILD_PLAN.md`, `docs/QA_CHECKLIST.md`, `docs/PRIVACY_MODEL.md`

## Requirements

- Node.js 22+ (matches GitHub Actions)

## Run locally

```bash
npm install
npm run dev
```

Dev uses base path `/` (`/today`, `/import`, …). Production build uses `/Health`.

## Build & preview

```bash
npm run build
npm run preview
```

Output: **`build/`** for GitHub Pages.

## Tests and quality gates

```bash
npm run quality      # check + lint + test + build + verify:sw
npm run quality:e2e  # quality + Playwright e2e
```

GitHub Actions runs `npm run quality` on pull requests and before deploy.

## Deploy

Pushes to `main` run `.github/workflows/pages.yml` (build + `verify:sw` + publish `build/`).

After deploy, reload once if a stale service worker caches an old shell.

## Health Lock vs cloud

- **Health Lock (Phase 1):** protects this device with passkey / PIN + encrypted vault. Works offline on GitHub Pages.
- **Cloud passkey / backup (Phase 3):** optional; requires `PUBLIC_HEALTH_API_URL` and Supabase. Hidden or disabled when not configured.

See `docs/HEALTH_PASSKEY_SECURITY_IMPLEMENTATION.md`.

## Reset data

**System → Settings → Delete all local data**, or clear site data in the browser.

## Known limitations

- Cloud sync is **not** active on the public GitHub Pages deployment unless you configure the API.
- Very large onboarding file (`src/routes/+page.svelte`) is scheduled for component extraction.
- Screenshot visual regression may need `--update-snapshots` after intentional UI changes.
