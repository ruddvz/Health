# Health Repo — Master Fix, Redesign, iOS PWA, QA, and Agent Execution Plan

**Repo:** `https://github.com/ruddvz/Health`  
**Live app:** `https://ruddvz.github.io/Health/`  
**Document purpose:** Give an implementation agent one complete, repo-specific plan to fix the Health app end-to-end without needing repeated “next step” prompts.  
**Target result:** A polished, reliable, private, local-first health-plan companion that feels like a premium iOS PWA, not a raw JSON viewer.

---

## 0. Agent Operating Contract — Do Not Skip This

You are the implementation agent for this repository. Your job is not to make one small patch and stop. Your job is to work through this entire plan until the app meets the Definition of Done in Section 18.

### Non-negotiable execution rule

Work continuously through the full roadmap in priority order:

1. Stabilize the repo so it builds, checks, lints, and tests cleanly.
2. Fix empty, broken, confusing, or half-built user flows.
3. Apply the iOS PWA product redesign consistently across every route.
4. Complete feature parity with the useful legacy app behavior.
5. Harden privacy, health-safety copy, local storage, passkey lock, and cloud-passkey configuration.
6. Run automated and manual QA.
7. Update README, CHANGELOG, QA docs, and this checklist as work lands.
8. Do not stop until every P0/P1/P2 item is either completed or explicitly marked “blocked” with a real technical reason.

### Working style required

- Create a branch such as `agent/health-master-fix-ios-pwa`.
- Make small, reviewable commits by phase.
- After every phase, run:

```bash
npm install
npm run check
npm run lint
npm test
npm run build
npm run verify:sw
npm run test:e2e
```

- If a command fails, fix the failure before moving forward.
- Never delete the legacy app until all required behavior has been ported and verified.
- Prefer clean, boring, maintainable code over clever abstractions.
- Do not add heavy UI libraries unless there is a strong reason.
- Keep the app local-first and private by default.

---

## 1. Audit Summary

The repo is already in a good direction, but it is still unfinished as a product.

### What currently exists

- SvelteKit + TypeScript + Vite static build.
- GitHub Pages deployment with base path `/Health`.
- PWA plugin and service worker verification script.
- Legacy single-file app preserved under `legacy/`.
- Routes for intake/root, import, Today, Meals, Train, Progress, and System.
- Nothing OS-inspired visual language in design tokens.
- Local-first storage using browser storage.
- Schema v2 plan validation/migration direction.
- Local Health Lock with WebAuthn/passkey-style app lock, recovery PIN, recovery codes, and encrypted IndexedDB vault.
- Phase 3 Vercel/Supabase server-passkey and encrypted-backup scaffolding.
- E2E and manual QA checklist.

### What is still wrong

The app still feels like a rebuild in progress, not a final product. The biggest product issue is that a user can land on major tabs and see almost nothing if no plan is loaded. The app should always explain what is happening and what to do next.

The design direction is also split: the repo says Nothing OS-inspired, while the target now needs to feel like a polished iOS PWA. Keep the high-contrast, privacy-first, data-widget personality, but make the shell, spacing, tap targets, sheets, headers, forms, safe-area behavior, and transitions feel native to iPhone.

### Product north star

> “Open the app and immediately know: what should I do next, is my plan on track, and is my private health data safe?”

---

## 2. Repo Facts Verified During Audit

Use these facts as the current baseline before changing code.

- The README describes the app as a local-first PWA that turns structured JSON into an interactive daily dashboard.
- The README states that the current production app is a SvelteKit static build served from `/Health` on GitHub Pages.
- The README says the old full-featured single-file app is kept under `legacy/` for porting reference.
- `package.json` includes SvelteKit, TypeScript, Vite, Vitest, Playwright, Zod, SimpleWebAuthn, and Supabase dependencies.
- `vite.config.ts` configures `@vite-pwa/sveltekit`, `display: standalone`, `orientation: portrait`, and icons.
- `svelte.config.js` configures static adapter output to `build/` and production base path `/Health`.
- `src/app.html` has `viewport-fit=cover`, which is required for proper safe-area design on iPhones with notches/Dynamic Island, but it lacks several iOS home-screen meta tags.
- `docs/QA_CHECKLIST.md` already includes automated and manual checks, including service worker, Health Lock, passkey, and cloud backup checks.
- `docs/HEALTH_PASSKEY_SECURITY_IMPLEMENTATION.md` says Phase 1 local app lock is shipped and Phase 3 server passkeys/cloud backup need Vercel + Supabase deployment.
- The live `/today`, `/meals`, `/train`, and `/progress` routes currently render mostly only the shell/nav when no plan exists; this is a UX bug.
- The live `/system/security` route explains that Phase 1 is local app lock only and that synced passkeys need backend configuration.

---

## 3. Final Product Direction

### Do not build this as

- A JSON viewer.
- A generic gym tracker.
- A generic meal-planning template.
- A half-native / half-web page with browser-ish spacing.
- A dark dashboard full of random cards.

### Build this as

A private iPhone-first health execution companion:

- Local-first.
- Offline-first.
- Installable as a PWA.
- Fast on iPhone.
- Beautiful but not loud.
- Safe with health language.
- Useful every day.
- Clear in 5 seconds.
- Strong empty states.
- Native-feeling interactions.

### Visual personality

Use an **iOS Health Command Center** direction:

- iOS-style shell, sheets, bottom navigation, form controls, and safe-area spacing.
- Dark mode first, with a proper light mode.
- Subtle Nothing-style dot/glyph accents only where they improve personality.
- Do not let the dot-matrix style hurt readability.
- Do not overuse red. Red is for danger, destructive actions, and key Nothing-style accents. Use green/blue/amber for health states where appropriate.

---

## 4. P0 Problems to Fix First

These are urgent. Do them before visual polish.

| Priority | Problem                                                        | Why it matters                             | Required fix                                                                                                                                  |
| -------- | -------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Major routes are empty without a plan                          | Users think the app is broken              | Add premium no-plan empty states on Today, Meals, Train, Progress, and Diagnostics with clear CTAs to Import / Start Intake / Use Sample Plan |
| P0       | App goal is unclear at first launch                            | Intake starts as a form, not a product     | Add a strong welcome screen: “Build or import your private health plan” with two primary paths                                                |
| P0       | Root onboarding is too dense                                   | On mobile, it feels like a long form       | Convert intake into iOS card steps with progress, validation, saved state, and review                                                         |
| P0       | No clear sample/demo path                                      | Agent/tester cannot quickly see full UI    | Add “Load sample plan” in import/welcome, gated behind a clear demo label                                                                     |
| P0       | Health safety must be visible but calm                         | Nutrition/supplement advice can be risky   | Add safety framing, supplement caution, medication/allergy warnings, and red-flag checks                                                      |
| P0       | Cloud/passkey feature can confuse users                        | Local passkey vs server passkey is complex | Separate “Local Health Lock” and “Cloud Sync / Passkey Account” clearly                                                                       |
| P0       | API CORS is wildcard                                           | Bad production security posture            | Restrict CORS to configured origins before production cloud deployment                                                                        |
| P0       | Memory-store fallback could be accidentally used in production | Cloud backup/session data could disappear  | Fail closed in production if Supabase env vars are missing; allow memory store only in explicit dev mode                                      |
| P0       | Diagnostics claims “Plan parses” even with no plan             | False reassurance                          | Diagnostics must show “No plan loaded” with import CTA                                                                                        |
| P0       | Need guaranteed app update behavior                            | PWAs can feel stale                        | Keep update snackbar, verify SW, add version display, add forced cache refresh instructions                                                   |

---

## 5. Immediate Repo Stabilization Tasks

### 5.1 Format and readability

The raw files visible in GitHub are very compressed in several places. Ensure actual repo files are formatted normally.

Run:

```bash
npm run format
npm run lint
npm run check
```

Then inspect these files manually:

- `package.json`
- `vite.config.ts`
- `svelte.config.js`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/lib/stores/healthApp.ts`
- `src/lib/stores/healthLock.ts`
- `src/lib/security/vault.ts`
- `server/webauthn/handlers.ts`
- `server/webauthn/supabaseDb.ts`

### 5.2 Add missing quality gates

Add scripts if missing:

```json
{
	"scripts": {
		"quality": "npm run check && npm run lint && npm test && npm run build && npm run verify:sw",
		"quality:e2e": "npm run quality && npm run test:e2e"
	}
}
```

### 5.3 Create a visual regression habit

Add Playwright screenshot tests for:

- `/`
- `/import`
- `/today` with no plan
- `/today` with sample plan
- `/meals` with sample plan
- `/train` with sample plan
- `/progress` with sample plan
- `/system`
- `/system/security`
- `/system/diagnostics`

Use mobile viewport first:

- iPhone SE width 375
- iPhone standard width 390/393
- iPhone Pro Max width 430
- iPad/tablet width 768
- desktop width 1024+

---

## 6. Information Architecture Fix

Current nav is close: Today, Meals, Train, Progress, System.

Keep this.

### Final tabs

1. **Today** — next action, daily timeline, macros, water, warnings, prep reminders.
2. **Meals** — daily meals, swaps, cook mode, macro repair, add meal.
3. **Train** — today workout, set logger, rest timer, history.
4. **Progress** — weight, waist, check-ins, trends, export.
5. **System** — import/export, phases, grocery, prep, supplements, security, diagnostics, privacy, appearance, about.

### Root route `/`

Do not dump the user straight into a dense form.

Root should show:

- App brand/title.
- One-line promise: “Your private daily health plan, offline on your iPhone.”
- Primary CTA: “Create plan prompt.”
- Secondary CTA: “Import JSON.”
- Tertiary CTA: “Load sample plan.”
- Privacy statement: “No account required. Data stays on this device unless you enable cloud backup.”
- Continue draft if onboarding state exists.

Then intake starts after CTA.

---

## 7. Required Empty States

Every major route must be useful with no plan loaded.

### 7.1 Today no-plan state

Title: **No plan loaded yet**  
Body: “Import a Health JSON plan or create one from your intake answers. Once loaded, Today will show your next meal, workout, water, macros, reminders, and safety checks.”

Actions:

- Primary: `Import JSON`
- Secondary: `Create plan prompt`
- Ghost: `Load sample plan`

Show small preview cards disabled/ghosted:

- Next meal
- Macros
- Workout
- Plan checks

### 7.2 Meals no-plan state

Explain that meals are generated from the imported plan. Add CTA to import/sample.

### 7.3 Train no-plan state

Explain that the training program needs `training.weekly_split`. Add CTA to import/sample.

### 7.4 Progress no-plan state

Progress should still allow local logs even before a plan. Let the user log weight/waist/check-in without a plan, but explain that insights improve after importing a plan.

### 7.5 Diagnostics no-plan state

Do **not** show “Schema parses” if no plan exists. Show:

- No plan loaded.
- No validation run yet.
- Import a plan to inspect schema, meals, supplements, training, schedule, and safety.

---

## 8. iOS PWA Design System

### 8.1 Design target

The app should feel like it belongs on an iPhone home screen.

Key qualities:

- Safe-area aware.
- Bottom tab bar never overlaps content.
- Large readable cards.
- Native-like sheets.
- 44px minimum tap targets.
- Sticky but calm headers.
- Pull-to-refresh safe behavior.
- Smooth route transitions.
- No tiny controls.
- No desktop-first tables on mobile.

### 8.2 Typography

Use system fonts only:

```css
--font-ui:
	-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif;
--font-mono: 'SF Mono', ui-monospace, Menlo, monospace;
```

Rules:

- Body: 16px minimum.
- Card labels: 12–13px minimum.
- Hero metric: 32–48px depending on screen.
- Use mono/dot styling only for labels and command strips, not paragraphs.
- Never use external Google Fonts by default.

### 8.3 Color tokens

Keep the current dark identity but improve semantic states.

```css
:root {
	color-scheme: dark;

	--bg: #090a0c;
	--bg-elevated: #0f1115;
	--surface-1: #14161b;
	--surface-2: #1b1e25;
	--surface-3: #242833;

	--text-1: #f6f7f9;
	--text-2: #b8bec9;
	--text-3: #7c8494;

	--line-1: rgba(255, 255, 255, 0.08);
	--line-2: rgba(255, 255, 255, 0.14);

	--ios-blue: #0a84ff;
	--ios-green: #34c759;
	--ios-red: #ff453a;
	--ios-orange: #ff9f0a;
	--ios-yellow: #ffd60a;
	--ios-purple: #bf5af2;

	--accent: var(--ios-blue);
	--success: var(--ios-green);
	--warning: var(--ios-orange);
	--danger: var(--ios-red);

	--radius-card: 24px;
	--radius-control: 16px;
	--radius-sheet: 30px;
	--radius-pill: 999px;

	--safe-top: env(safe-area-inset-top, 0px);
	--safe-bottom: env(safe-area-inset-bottom, 0px);
	--nav-h: 76px;
}
```

### 8.4 Light mode

Light mode cannot be an afterthought. It must be intentionally designed.

```css
:root[data-theme='light'] {
	color-scheme: light;
	--bg: #f4f6fb;
	--bg-elevated: #ffffff;
	--surface-1: #ffffff;
	--surface-2: #f6f8fc;
	--surface-3: #eef2f8;
	--text-1: #111827;
	--text-2: #4b5563;
	--text-3: #7b8494;
	--line-1: rgba(17, 24, 39, 0.08);
	--line-2: rgba(17, 24, 39, 0.14);
}
```

### 8.5 Card system

Create a small set of reusable primitives:

- `AppShell`
- `ScreenHeader`
- `HeroActionCard`
- `MetricCard`
- `HealthCard`
- `ActionRow`
- `SettingsRow`
- `SegmentedControl`
- `BottomSheet`
- `Toast`
- `InlineAlert`
- `EmptyState`
- `ProgressRing` or `MacroRing`
- `TimelineItem`

Every route should use these, not custom one-off card styles.

### 8.6 Bottom navigation

Bottom nav requirements:

- Fixed bottom with safe-area padding.
- Blur/translucency is okay, but keep contrast high.
- Active state must be clear.
- Tap target at least 44px.
- Content bottom padding must be `calc(var(--nav-h) + var(--safe-bottom) + 20px)`.
- The nav should not cover buttons, sheets, or form fields.

### 8.7 Sheets and modals

Use bottom sheets on mobile for:

- Add meal.
- Cook mode.
- Swaps.
- Macro repair.
- Lock setup.
- Recovery codes.
- Export confirmation.
- Delete confirmation.

Sheet rules:

- Drag handle.
- Max height 86vh.
- Internal scroll only when needed.
- Close button always visible.
- Escape/overlay close on desktop.
- Focus trap.
- `aria-modal="true"`.

---

## 9. iOS PWA Technical Requirements

### 9.1 `src/app.html`

Keep `viewport-fit=cover`, but add iOS PWA metadata.

Recommended target:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#090a0c" />
<meta name="color-scheme" content="dark light" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Health" />
<meta name="format-detection" content="telephone=no" />
<link rel="apple-touch-icon" href="%sveltekit.assets%/icons/apple-touch-icon.png" />
```

Remove or justify any non-standard meta such as:

```html
<meta name="text-scale" content="scale" />
```

If text scaling needs control, handle it with CSS and accessibility testing, not a fake meta tag.

### 9.2 Manifest

Improve the PWA manifest in `vite.config.ts`:

- Add `id`.
- Add `lang`.
- Add `dir`.
- Add `shortcuts` for Today, Meals, Train, Progress.
- Add screenshots for install surfaces if supported.
- Keep `start_url` and `scope` correct for `/Health/`.
- Ensure icons include true maskable safe-zone art.
- Ensure the background color matches launch screen.

Example:

```ts
manifest: {
  id: `${basePath}/`,
  name: 'Health — Personal Plan',
  short_name: 'Health',
  lang: 'en',
  dir: 'ltr',
  description: 'Private offline health plan companion',
  start_url: `${basePath}/`,
  scope: `${basePath}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#090a0c',
  theme_color: '#090a0c',
  categories: ['health', 'fitness', 'lifestyle'],
  shortcuts: [
    { name: 'Today', url: `${basePath}/today`, icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }] },
    { name: 'Meals', url: `${basePath}/meals`, icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }] },
    { name: 'Train', url: `${basePath}/train`, icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }] }
  ]
}
```

### 9.3 Service worker behavior

Keep `verify:sw`, but improve behavior:

- App shell must load offline after first visit.
- `index.html` / navigation fallback should update properly.
- Update snackbar must be obvious but not annoying.
- Add “Refresh app” action.
- Add version/build hash in System → About.
- Add manual “Clear app cache and reload” helper for debugging.

### 9.4 Standalone display detection

Add helper:

```ts
export function isStandalonePwa(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}
```

Use it for:

- Install instructions.
- Status bar styling notes.
- Reduced browser-specific copy.

### 9.5 iOS install education

iOS does not show the same install prompt as Chrome. Add a small System card:

**Install on iPhone**

1. Open in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Open Health from the home screen.

Do not show this card when already standalone.

---

## 10. Route-by-Route Fix Plan

## 10.1 Root / Intake

### Problems

- Too form-heavy at first launch.
- User does not get the app value before answering questions.
- Stepper content can feel cramped on iPhone.
- Current labels are functional but not premium.

### Required redesign

Root should become a welcome + intake launcher.

Sections:

1. Hero card.
2. Three path cards:
   - Create a plan prompt.
   - Import JSON.
   - Load sample plan.
3. Privacy card.
4. Continue draft card if onboarding exists.

Intake should be step-based:

- About you.
- Goal.
- Training.
- Food & kitchen.
- Supplements.
- Life & schedule.
- Review.

Each step should have:

- One title.
- One sentence explaining why it matters.
- 3–6 fields max visible at once.
- Inline validation.
- Back/Continue sticky footer.
- “Use example values” secondary action.
- Autosave indicator.

### Acceptance criteria

- First-time user understands the app in 5 seconds.
- User can skip directly to JSON import.
- User can generate a high-quality prompt from intake.
- No field is covered by bottom nav or keyboard.
- All inputs are usable on iPhone SE width.

---

## 10.2 Import Route

### Required features

- Paste JSON.
- Upload JSON file.
- Load sample plan.
- Show validation result before applying.
- Show schema version.
- Show warnings separately from blocking errors.
- Show what will be saved locally.
- Offer Health Lock after successful import.

### Required UI

Import screen sections:

1. Header: “Import your plan.”
2. Upload/paste card.
3. Validation result card.
4. Preview card: name, goal, calories, protein, plan length, training days, number of meals.
5. Apply button.
6. Privacy note.

### Required safeguards

- File size cap: 2 MB.
- Reject malformed JSON.
- Reject unsupported schema unless migration is possible.
- Sanitize all strings.
- Never render JSON text via `innerHTML`.
- Show specific errors.

---

## 10.3 Today

Today is the most important screen.

### Current issue

Without a plan, the route appears mostly empty. With a plan, it must become the daily command center.

### Required layout

1. **Header / command strip**
   - Date.
   - Local-only status.
   - Week/phase.
   - Workout/rest day toggle.

2. **Next action hero**
   - Next meal, workout, prep, supplement, water, or check-in.
   - One primary CTA.

3. **Daily rings / macro cards**
   - Calories.
   - Protein.
   - Water.
   - Steps/activity if available.

4. **Timeline**
   - Wake.
   - Meals.
   - Training.
   - Supplements.
   - Sleep.

5. **Plan checks**
   - Warnings.
   - Safety notes.
   - Missing data.

6. **Quick actions**
   - Add meal.
   - Log weight.
   - Start workout.
   - Export data.

### Acceptance criteria

- Today answers “what next?” above the fold.
- Today works on workout and rest day.
- Today has a useful no-plan state.
- Today handles missing schedule gracefully.
- No warning sounds like medical diagnosis.

---

## 10.4 Meals

### Required layout

1. Day type segmented control: Workout / Rest.
2. Phase selector.
3. Macro summary.
4. Meal cards by time.
5. Swap drawer.
6. Cook mode sheet.
7. Add meal sheet.
8. Macro repair sheet.
9. Backup/busy-day meals.

### Meal card requirements

Each meal card should show:

- Time.
- Meal name.
- Calories.
- Protein/carbs/fat.
- Ingredient list.
- Prep/cook time if available.
- CTA: Cook mode.
- CTA: Swaps.
- CTA: Log eaten.

### Macro repair

If actual totals miss target:

- Suggest simple add-ons.
- Explain how much they add.
- Do not shame the user.
- Do not suggest unsafe restriction.

Example:

> “You are about 22g protein short. Add Greek yogurt, paneer, eggs, or a protein shake depending on your diet preference.”

---

## 10.5 Train

### Required layout

1. Today workout hero.
2. Exercise list.
3. Start workout CTA.
4. Session logger.
5. Rest timer.
6. Substitutions.
7. Training history.
8. Strength stats.

### Required behavior

- If `training.weekly_split` exists, render it clearly.
- If only a training note exists, show helpful fallback and request full program.
- Track sets locally.
- Save completed sessions locally.
- Rest timer must continue while route remains open.
- Avoid overcomplicated gym-app behavior.

### Acceptance criteria

- User can complete one workout without confusion.
- Exercise cards are readable on iPhone.
- No plan = useful empty state.
- Training history is exportable.

---

## 10.6 Progress

### Required layout

1. Current weight card.
2. Weight trend.
3. Waist trend.
4. Weekly check-in.
5. Photos reminder placeholder, not mandatory upload.
6. Insights.
7. Export progress.

### Required behavior

- Progress logging should work even without a loaded plan.
- Store data locally.
- Allow delete/edit of logs.
- Export progress JSON.
- Avoid medical claims.

### Insight examples

Good:

- “Weight has moved down 0.6 kg over 14 days.”
- “You logged 3 check-ins this week.”
- “Your plan has low protein warnings. Review Meals.”

Bad:

- “You are losing fat perfectly.”
- “This supplement will fix sleep.”
- “Your hormones are improving.”

---

## 10.7 System

System should be the control center.

### Required sections

1. Privacy & data.
2. Health Lock.
3. Import/export.
4. Diagnostics.
5. Phases.
6. Grocery.
7. Prep.
8. Supplements.
9. Appearance.
10. About.
11. Developer/debug tools behind a collapsible section.

### Required improvements

- Keep System as a hub but reduce visual clutter.
- Group rows into iOS-style cards.
- Make destructive actions visually distinct.
- Add “App version / build / SW status.”
- Add “Installed as PWA?” status.
- Add “Storage used” estimate if easy.

---

## 10.8 Security / Health Lock

### Current direction is good

The app already has local passkey/Face ID-style Health Lock, recovery PIN, recovery codes, and encrypted vault direction.

### Required UX clarification

Separate these clearly:

#### Local Health Lock

- Protects this installed app on this device.
- Works offline.
- Uses Face ID / Touch ID / device authenticator where available.
- Still needs recovery PIN for encrypted data after cold start.

#### Cloud Passkey Account

- Optional future mode.
- Needs deployed API and Supabase.
- Used for encrypted cloud backup/sync.
- Not required for local PWA use.

### Required copy improvements

Current copy is okay but too technical in places. Make it more user-facing.

Example:

> “Health Lock keeps your plan private on this device. It is not a medical security system and it does not upload your plan. If you enable cloud backup later, that will be shown separately.”

### Required safeguards

- Do not imply Face ID encrypts data by itself.
- Explain recovery PIN clearly.
- Recovery codes must be shown once and copied/downloaded.
- Confirm before deleting lock data.
- Lock state must survive refresh.
- Auto-lock must work when app is hidden.

---

## 11. Cloud Passkey / API Hardening

The repo has Phase 3 scaffolding, but do not treat it as production-ready until hardened.

### 11.1 CORS

Current API headers allow `Access-Control-Allow-Origin: *`. Replace with an allowlist.

Required behavior:

- Read allowed origins from env, e.g. `HEALTH_ALLOWED_ORIGINS`.
- Allow local dev origins only in development.
- For production, allow only:
  - `https://ruddvz.github.io`
  - final custom Health domain if used
  - any explicit configured origin

Pseudo:

```ts
const allowed = new Set(
	(process.env.HEALTH_ALLOWED_ORIGINS ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
);
const origin = request.headers.get('Origin');
const allowOrigin = origin && allowed.has(origin) ? origin : 'https://ruddvz.github.io';
```

### 11.2 Memory store fallback

Current env logic can fall back to memory store if Supabase env vars are missing. That is okay for dev, dangerous for production.

Required change:

- Add `HEALTH_ALLOW_MEMORY_STORE=true` for dev only.
- If deployed and Supabase vars are missing, return 500 with clear error.
- `/api/health/status` should reveal mode but not secrets.

### 11.3 Session security

- Store server sessions hashed, not raw token if practical.
- Add expiry cleanup.
- Add logout endpoint.
- Add rate limits to passkey/register/auth endpoints.
- Validate JSON body size.
- Do not allow unlimited challenge creation.

### 11.4 Backup security

- Cloud backup should store only encrypted payloads.
- Encryption password/key must never be sent to server.
- Show backup last updated.
- Add restore flow with confirmation.
- Add backup delete endpoint.

---

## 12. Health Safety and Content Rules

This app handles health, nutrition, supplements, and training. It must be careful.

### Required global health copy

Add a calm disclaimer in System → Privacy/About and during import:

> “Health is a planning and tracking companion. It does not provide medical diagnosis or emergency advice. Review major diet, supplement, medication, injury, pregnancy, diabetes, eating-disorder, or medical-condition decisions with a qualified professional.”

### Warnings to detect

Validation should flag:

- Very low calories.
- Extreme weight-loss pace.
- Very high water intake.
- Missing allergies field.
- Medication checkbox true + supplements present.
- Supplements with strong claims.
- Training plan with injury notes but no modifications.
- Meal times outside wake/sleep schedule.
- Duplicate IDs.
- Missing protein/calorie totals.
- Calories too far from target.
- Protein too far below target.

### Tone rules

Use:

- “Review.”
- “Check.”
- “Consider.”
- “This may need adjustment.”

Avoid:

- “Safe.”
- “Guaranteed.”
- “Fixes.”
- “Cures.”
- “Clinically proven” unless sourced and appropriate.
- Any diagnosis language.

---

## 13. Data Model and Validation

### Required schema direction

Keep Schema v2 as the canonical plan contract.

Top-level sections:

```ts
meta;
user;
schedule;
nutrition;
training;
meals;
prep;
grocery;
supplements;
progress;
safety;
```

### Required validation result shape

```ts
type ValidationLevel = 'error' | 'warning' | 'info';

type ValidationIssue = {
	level: ValidationLevel;
	code: string;
	path: string;
	message: string;
	fixHint?: string;
};

type ValidationResult<T> =
	| { ok: true; plan: T; issues: ValidationIssue[] }
	| { ok: false; issues: ValidationIssue[] };
```

### Required normalization

On import:

1. Parse JSON.
2. Detect schema version.
3. Migrate if possible.
4. Normalize defaults.
5. Enrich derived totals.
6. Validate.
7. Show errors/warnings.
8. Save only if errors are resolved or explicitly allowed for warnings.

### Required storage keys

Keep namespaced keys, for example:

```text
health.v2.plan
health.v2.progress
health.v2.settings
health.v2.onboarding
health.v2.activeDayType
health.v2.security
```

Avoid ambiguous old keys.

---

## 14. Privacy and Local-First Requirements

### Default mode

- No account.
- No analytics.
- No remote fonts.
- No third-party scripts.
- Data stays on device.
- Export/delete always available.

### Storage UI

System → Privacy/Data should show:

- What is stored.
- Where it is stored.
- How to export.
- How to delete.
- Whether Health Lock is enabled.
- Whether cloud backup is enabled.
- Last backup time if cloud backup exists.

### Delete flow

Destructive delete flow must:

1. Explain exactly what will be removed.
2. Ask for confirmation.
3. Clear localStorage, IndexedDB vault, security state, progress, plan, onboarding.
4. Return to root welcome.
5. Show success toast.

---

## 15. Accessibility Requirements

Minimum target: WCAG 2.2 AA basics.

### Must-have

- 44px minimum tap targets.
- Visible focus states.
- Keyboard navigation.
- `aria-live` for validation, import success/error, SW updates, lock errors.
- Proper labels for inputs.
- Do not rely only on color.
- Reduced motion support.
- Text contrast checked in dark and light mode.
- Dialogs/sheets focus trapped.
- Back buttons and nav links have accessible labels.

### Reduced motion CSS

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.001ms !important;
		animation-iteration-count: 1 !important;
		scroll-behavior: auto !important;
		transition-duration: 0.001ms !important;
	}
}
```

---

## 16. Performance Requirements

### Goals

- Fast first load on iPhone.
- Smooth tab switching.
- No heavy chart libraries.
- No huge state re-renders.
- Minimal dependencies.
- Offline app shell.

### Required tasks

- Lazy-load route-heavy components if needed.
- Use derived stores for calculations.
- Debounce persistence writes.
- Avoid recalculating macro totals on every tiny UI event.
- Keep sample JSON compressed/minimal.
- Add route-level skeletons only where useful.
- Run Lighthouse/PWA checks after build.

---

## 17. File-by-File Worklist

### Core app shell

- `src/app.html`
  - Add iOS PWA meta tags.
  - Add apple-touch-icon.
  - Remove fake/non-standard text-scale meta if not needed.

- `src/routes/+layout.svelte`
  - Make shell clean, safe-area aware, and route-lock aware.
  - Ensure no route renders blank behind lock/no-plan state.
  - Ensure nav is hidden only where intended.

- `src/routes/+layout.ts`
  - Confirm prerender/static behavior is correct.

- `src/lib/components/app/*`
  - Build/clean AppShell, BottomNav, ScreenHeader, EmptyState, Toast, BottomSheet.

### Styles

- `src/lib/styles/tokens.css`
  - Refine iOS PWA tokens.
  - Keep dark and light semantic tokens.

- `src/lib/styles/global.css`
  - Safe-area body layout.
  - Base typography.
  - Disable horizontal overflow.
  - Add reduced motion.

- `src/lib/styles/theme-light.css`
  - Make light mode production quality.

- `src/lib/styles/nothing.css`
  - Reduce dot-matrix overuse.
  - Keep accents only where useful.

### Root and import

- `src/routes/+page.svelte`
  - Convert to welcome + intake launcher.
  - Move dense intake to clean components if not already separated.

- `src/routes/import/+page.svelte`
  - Import/paste/upload/sample flow.
  - Validation preview.
  - Health Lock offer after import.

### Today

- `src/routes/today/+page.svelte`
  - Add no-plan empty state.
  - Build daily command center.
  - Ensure next action logic works.

### Meals

- `src/routes/meals/+page.svelte`
  - Add no-plan empty state.
  - Clean cards, cook mode, swaps, add meal, macro repair.

### Train

- `src/routes/train/+page.svelte`
  - Add no-plan empty state.
  - Improve workout flow.
  - Session logger and history.

- `src/routes/train/session/*`
  - If present, ensure it works fully on mobile.

### Progress

- `src/routes/progress/+page.svelte`
  - Allow logging without plan.
  - Add edit/delete/export.
  - Add trend cards.

### System

- `src/routes/system/+page.svelte`
  - Group settings into iOS-style cards.
  - Add PWA status and version.

- `src/routes/system/security/*`
  - Clarify local vs cloud passkey.
  - Improve recovery code and PIN flows.

- `src/routes/system/diagnostics/*`
  - Fix no-plan false positive.
  - Show validation issues by severity.

- `src/routes/system/privacy/*`
  - Add privacy explainer.

- `src/routes/system/settings/*`
  - Appearance, export, danger zone.

### Stores and logic

- `src/lib/stores/healthApp.ts`
  - Debounce writes.
  - Ensure encrypted vault behavior is consistent.
  - Ensure clear all data clears everything.

- `src/lib/stores/healthLock.ts`
  - Verify auto-lock, recovery, PIN, encrypted vault flows.

- `src/lib/stores/vaultBridge.ts`
  - Ensure complete snapshot coverage.

- `src/lib/validation/*`
  - Improve structured issues.
  - Add tests.

- `src/lib/logic/*`
  - Consolidate macro calculations, schedule calculations, day totals, warnings.

### API/cloud

- `server/webauthn/http.ts`
  - Replace wildcard CORS.

- `server/webauthn/env.ts`
  - Fail closed outside explicit dev memory mode.

- `server/webauthn/handlers.ts`
  - Rate limit.
  - Body size guard.
  - Better error messages.
  - Logout/delete backup endpoints if needed.

- `server/webauthn/supabaseDb.ts`
  - Handle Supabase errors explicitly.
  - Hash session tokens if practical.

- `api/*`
  - Ensure method checks, error formats, and CORS are consistent.

### Tests

- `e2e/*`
  - Add no-plan empty state tests.
  - Add sample-plan journey.
  - Add mobile viewport screenshots.

- `src/**/*.spec.ts`
  - Add validation tests.
  - Add schedule tests.
  - Add macro repair tests.
  - Add progress trend tests.

### Docs

- `README.md`
  - Update current status.
  - Add install, run, deploy, QA.

- `CHANGELOG.md`
  - Update after each phase.

- `docs/QA_CHECKLIST.md`
  - Expand iOS PWA QA.

- `docs/HEALTH_PASSKEY_SECURITY_IMPLEMENTATION.md`
  - Update with CORS/memory-store hardening and deployment realities.

---

## 18. Definition of Done

The project is done only when all of these are true.

### Product

- First screen explains the app clearly.
- User can create prompt, import JSON, or load sample.
- No major route is blank.
- Today clearly shows the next action.
- Meals are actionable.
- Training can be completed.
- Progress can be logged/exported.
- System provides control over data, security, diagnostics, privacy, and settings.

### Design

- Feels like a premium iPhone PWA.
- Works on iPhone SE, standard iPhone, Pro Max, iPad, desktop.
- Safe areas are respected.
- Bottom nav never overlaps content.
- Dark and light modes are polished.
- Components are consistent.

### PWA

- Installable.
- Works offline after first load.
- Update snackbar works.
- App icon is correct.
- Manifest is complete.
- iOS home-screen metadata is present.

### Privacy/security

- Local-first default is clear.
- Export/delete work.
- Health Lock works where WebAuthn is available.
- Recovery PIN/codes are understandable.
- Cloud backup is disabled/clear unless configured.
- API is not permissive in production.

### Health safety

- App avoids medical claims.
- Supplement language is cautious.
- Medication/allergy warnings are visible.
- Extreme plan warnings exist.

### Engineering

All pass:

```bash
npm run check
npm run lint
npm test
npm run build
npm run verify:sw
npm run test:e2e
```

Docs updated:

- README.
- CHANGELOG.
- QA checklist.
- Passkey/security doc.

---

## 19. Phase-by-Phase Execution Plan

## Phase 0 — Baseline and audit lock

- Create branch.
- Run all existing commands.
- Record failures.
- Format code.
- Add `quality` script.
- Do not change product behavior yet except obvious broken build issues.

Deliverable:

- Clean baseline or a documented failure list.

---

## Phase 1 — No-plan states and first-run clarity

Tasks:

- Redesign `/` welcome.
- Add no-plan states for Today, Meals, Train, Progress, Diagnostics.
- Add import/sample CTAs everywhere.
- Add sample plan load path.

Acceptance:

- A new user never sees an empty shell.
- Every tab explains itself.

---

## Phase 2 — iOS PWA shell and design primitives

Tasks:

- Add iOS meta tags.
- Improve manifest.
- Build/refine AppShell, BottomNav, ScreenHeader, EmptyState, BottomSheet, Toast, MetricCard.
- Apply safe-area content padding.
- Refine tokens dark/light.

Acceptance:

- App feels stable and native-like on iPhone.
- No overlap bugs.

---

## Phase 3 — Import, validation, and diagnostics

Tasks:

- Improve import UI.
- Add validation result preview.
- Add structured issues.
- Fix diagnostics no-plan false positive.
- Add normalized export.

Acceptance:

- Invalid JSON errors are clear.
- Warnings are useful.
- Diagnostics reflects reality.

---

## Phase 4 — Today command center

Tasks:

- Next action hero.
- Macro cards/rings.
- Timeline.
- Water control.
- Plan checks.
- Quick actions.

Acceptance:

- Today answers “what next?” instantly.

---

## Phase 5 — Meals workflow

Tasks:

- Meal cards.
- Cook mode sheet.
- Swaps.
- Add meal.
- Macro repair.
- Backup meals.

Acceptance:

- User can use Meals daily without opening raw JSON.

---

## Phase 6 — Train workflow

Tasks:

- Today workout.
- Exercise cards.
- Start/finish session.
- Rest timer.
- History.
- Lift stats.

Acceptance:

- User can complete one workout session and see history.

---

## Phase 7 — Progress workflow

Tasks:

- Weight/waist logging.
- Check-ins.
- Trend cards.
- Edit/delete.
- Export.
- Safe insights.

Acceptance:

- Progress works without plan and improves with plan.

---

## Phase 8 — System, privacy, security, cloud hardening

Tasks:

- Improve System layout.
- Clarify privacy.
- Polish Health Lock UI.
- Harden CORS.
- Fail closed for missing Supabase env in production.
- Add cloud backup deployment warnings.

Acceptance:

- Users understand local vs cloud security.
- API is not accidentally unsafe.

---

## Phase 9 — QA, docs, release polish

Tasks:

- Expand Playwright tests.
- Add screenshots.
- Run manual QA on iPhone Safari/PWA.
- Update docs.
- Update changelog.
- Confirm GitHub Pages deploy.

Acceptance:

- App is ready to use as a polished personal PWA.

---

## 20. Manual QA Checklist for Agent

### iPhone PWA

- [ ] Open in Safari.
- [ ] Add to Home Screen.
- [ ] Launch standalone.
- [ ] Status bar does not cover content.
- [ ] Bottom nav does not cover controls.
- [ ] Keyboard does not hide active input.
- [ ] Back/forward behavior is sane.
- [ ] Offline launch works after first load.
- [ ] Update snackbar appears after deploy.

### First run

- [ ] Root page explains app.
- [ ] Create prompt path works.
- [ ] Import JSON path works.
- [ ] Load sample plan works.
- [ ] Autosave works.

### Import

- [ ] Valid JSON imports.
- [ ] Invalid JSON shows clear error.
- [ ] > 2 MB file rejected.
- [ ] Warnings shown without blocking unnecessarily.
- [ ] Apply saves plan.
- [ ] Health Lock offer appears.

### Main tabs

- [ ] Today no-plan.
- [ ] Meals no-plan.
- [ ] Train no-plan.
- [ ] Progress no-plan.
- [ ] Today with sample plan.
- [ ] Meals with sample plan.
- [ ] Train with sample plan.
- [ ] Progress with sample plan.

### System

- [ ] Export plan.
- [ ] Export progress.
- [ ] Delete all data.
- [ ] Diagnostics no-plan.
- [ ] Diagnostics with warnings.
- [ ] Privacy copy.
- [ ] Appearance dark/light.

### Health Lock

- [ ] Enable PIN lock.
- [ ] Enable passkey where supported.
- [ ] Recovery codes generated.
- [ ] Lock now.
- [ ] Unlock with PIN.
- [ ] Unlock with passkey.
- [ ] Wrong PIN lockout.
- [ ] Delete security data.

### Cloud passkey / backup, only when configured

- [ ] API status endpoint returns configured mode.
- [ ] Register passkey account.
- [ ] Authenticate account.
- [ ] Upload encrypted backup.
- [ ] Restore encrypted backup.
- [ ] Logout.
- [ ] Production CORS rejects unknown origins.

---

## 21. Suggested Agent Commit Sequence

1. `chore: establish quality baseline`
2. `fix: add no-plan states across primary routes`
3. `feat: redesign first-run welcome and intake launcher`
4. `style: add iOS PWA design tokens and shell primitives`
5. `feat: improve import validation and sample plan flow`
6. `feat: rebuild Today command center`
7. `feat: improve Meals workflow and macro repair`
8. `feat: improve Training session flow`
9. `feat: improve Progress logging and export`
10. `feat: polish System, Privacy, Diagnostics, and Security`
11. `security: harden cloud passkey API configuration`
12. `test: add mobile and PWA regression coverage`
13. `docs: update README, changelog, QA, and security docs`

---

## 22. Final Notes for Agent

This repo already has many good pieces. Do not throw everything away. The correct strategy is:

- Preserve the SvelteKit + TypeScript foundation.
- Preserve local-first behavior.
- Preserve legacy app reference until parity is verified.
- Preserve the Health Lock direction, but clarify it.
- Preserve the widget personality, but make the app feel like a premium iOS PWA.
- Replace blank/placeholder product moments with clear, useful flows.
- Make every screen feel finished.

The final app should feel like something the user can actually install on an iPhone and use every morning without thinking about JSON, code, or deployment details.
