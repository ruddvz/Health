# NutriPal — UI/UX Audit & Implementation Plan v3

> **Written after a full code review of every file in `main` as of May 2026.**
> Senior-developer-level audit. Role: UI/UX lead + architect.
> **For the build agent:** jump straight to §12 — the ordered PR task list.

---

## 1. What Already Works (Do NOT break)

| Thing | Status |
|---|---|
| File structure (all files present) | ✅ Good |
| Design tokens (`tokens.css`) | ✅ Perfect |
| Glass component system (`components.css`) | ✅ Good |
| `i18n.js` — all 3 languages, dot-notation `t()` | ✅ Complete |
| `store.js` — localStorage contract | ✅ Clean |
| `plangen.js` — TDEE, macros, phase builder, grocery, prep, supps | ✅ Correct logic |
| Onboarding flow (16 steps, back button, progress bar) | ✅ Functional |
| App shell + bottom nav + settings panel | ✅ Working |
| Service worker + manifest | ✅ Correct |
| All 6 page mounts (home, phases, meals, prep, grocery, supps) | ✅ Render |

**The app is functional end-to-end.** The problems are entirely UX, polish, and several real bugs — not missing features.

---

## 2. Critical Bugs (break the experience today)

### BUG-1 — Syntax error in `onboarding.js` line 69
```js
// BROKEN — missing closing brace on t() call:
<h2>${t("lang.gu") ગુજ્લિશ</h2>
// SHOULD BE:
<h2>${t("lang.gu")} ગુજ્લિશ</h2>
```
**Impact:** Gujlish language card crashes JS — entire onboarding fails to load.

### BUG-2 — `app.js` never calls `render()` on init
`app.js` exports `setupSettings()` and defines `render()` but never calls either at module load. The app shows a blank screen unless a nav button is clicked.

**Fix:** Add at the bottom of `app.js`:
```js
setupSettings();
render();
```

### BUG-3 — `onboarding.js` step 69 template literal — Gujarati script unescaped
Same as BUG-1. The Gujarati unicode `ગુજ્લિશ` is placed inside a template literal without being wrapped in a string — JS parser chokes on it.

### BUG-4 — Height slider has no ft/in toggle
Step 6 (height) only shows cm. The plan (Section 2) specifies a `cm/ft` toggle. Missing entirely.

### BUG-5 — `supps.js` labels are hardcoded English
`const LABEL = { creatine: "Creatine", ... }` — these are never run through `t()`. Supplement names appear in English regardless of language choice.

### BUG-6 — Grocery page `cat_veg` key lookup is wrong
```js
// CURRENT (broken for "veg"):
const key = c === "veg" ? "grocery.cat_veg" : c === "dairy" ? "grocery.cat_dairy" : `grocery.cat_${c}`;
// This generates "grocery.cat_veg" ← correct, but "dairy" branch never runs because the ternary short-circuits.
// Actual issue: "pantry" generates "grocery.cat_pantry" which is undefined in i18n.js
```
Add `cat_pantry` to all 3 language blocks in `i18n.js`. Currently missing.

### BUG-7 — `app.js` is missing its init call (init never runs)
The entire app depends on `setupSettings()` + `render()` being called. Neither is called. The file ends at line 103 with just the service worker register call.

---

## 3. UX Deficiencies (ranked by user impact)

### UX-1 — Onboarding: no "tap to select → auto-advance" on single-choice steps
Steps 3 (goal), 8 (sex), 9 (activity), 10 (training days), 11 (diet type) are all single-choice. The user picks one option then has to tap "Continue." Every great mobile onboarding (Duolingo, Calm, Headspace) auto-advances single-choice steps after 300–400ms. This adds 11+ unnecessary taps.

**Fix:** After `data.goal = b.dataset.g` (and equivalent), call `setTimeout(() => advance(), 350)`.

### UX-2 — Home page greeting is styled as `step-sub` (dim, small)
The greeting `"Good morning, Rudra."` is the most personal thing in the app — it should be the hero headline, not a grey subtext. Currently uses `.step-sub` class which renders at 0.9rem with 60% opacity.

**Fix:** Wrap greeting in its own large styled element, not `step-sub`.

### UX-3 — Nav icons are placeholder `nav-dot` squares
The bottom nav renders a grey 22×22px rounded square as the "icon" for every tab. Six identical grey squares with tiny labels below them. Users cannot distinguish tabs visually at a glance.

**Fix:** Add SVG inline icons per tab (Home=house, Phases=chart, Meals=fork, Prep=clock, Grocery=basket, Supps=pill). Each fits in ~24×24 viewBox.

### UX-4 — Meals page: ingredient list has no visual hierarchy
Ingredients render as a plain `<ul>` with `color: var(--text-dim)`. Every item looks the same. Protein source, carb, veg — all identical grey text. High-density info with no structure.

**Fix:** Add a coloured left-border dot per ingredient category (protein=teal, carbs=lime, veg=orange, dairy=white-dim). This is a 3-line CSS addition.

### UX-5 — Phases page: calorie numbers have no visual emphasis
"Calories: 1840 kcal" is `<strong>` on the same line as label. The number is the most important thing on the card — it needs visual hierarchy: larger font, accent colour.

**Fix:** Render calorie number in accent-lime, larger size. Macros in a flex row with badges, not a paragraph.

### UX-6 — No feedback on onboarding completion
When onboarding finishes, it instantly redirects to `app.html`. The loading screen (step 15) shows an Axo SVG and a progress bar — but there is zero celebration moment. The plan says Axo should show the `flex` (victory) pose at the end. Currently `pose` switches to "flex" at step ≥15, but the loading screen's Axo is the same floating bob as every other step — no special animation.

**Fix:** On the loading screen, add a CSS keyframe that makes the Axo scale up then settle, with a short burst of CSS sparkle pseudo-elements.

### UX-7 — Grocery page: check-off state resets on tab switch
When the user checks off "Chicken breast" under Protein, then taps Carbs, then comes back — the checked state is visually gone (even though it's saved in localStorage). The `renderInner()` function re-reads `checked` from the Set correctly, but `checked` was initialised once at `mountGrocery()` call time. If the user navigates away and back (new `mountGrocery()` call), checked Set is re-read from storage — this is fine. But within a single session, switching category tabs triggers `renderInner()` which does re-render from the `checked` Set (in memory), so the state should persist. **Confirmed not a bug on tab switch.** However: if the user navigates to another page and back, `mountGrocery()` is called again, which re-reads from localStorage. This is correct. Mark as non-issue.

### UX-8 — No "reset / redo quiz" option in settings
The settings panel only offers language change. There is no way to start over without clearing browser storage manually. Users who enter wrong data (wrong weight, wrong diet type) are stuck.

**Fix:** Add a "Reset & restart" button in the settings panel that calls `clearAll()` then redirects to `index.html`.

### UX-9 — Prep page is one static list with no interaction
The Sunday prep guide is a read-only `<ol>`. No way to tick off steps as you cook. This is the most "in-the-moment" page of the app (you're literally in the kitchen) and it has the least interactivity.

**Fix:** Make prep steps checkable. Same pattern as grocery items. Persist with a `np_prep_done` key.

### UX-10 — Splash screen (step 1) "tap anywhere to begin" text doesn't work — only the button does
The text says "Tap anywhere to begin" but only the "Continue" button triggers advance. User confusion.

**Fix:** Add a click listener on the whole step-1 `root` container that calls `advance()`.

### UX-11 — Settings panel is not translated
The settings panel in `app.html` is hardcoded: `<h2 id="settings-title">Language</h2>` and `<p class="step-sub" id="settings-sub">Pick language</p>`. `app.js` does update the `h2` via `t("settings.title")` on open, but the sub-paragraph is never updated and `settings-sub` is not in i18n strings.

**Fix:** Either remove `settings-sub` or add `settings.sub` key to all 3 languages and update it on open.

### UX-12 — No haptic / tactile feedback pattern documented
iOS Safari supports `navigator.vibrate()` (limited) and the CSS `:active` scale already handles the visual tap feel. No issue with current implementation — the `scale(0.96)` is correct. Non-issue.

### UX-13 — `onb-back` button says "←" (arrow character, not icon)
Acceptable but improvable. Could be `‹` or a proper SVG chevron for cleaner look.

### UX-14 — Height step missing ft/in display and toggle
See BUG-4. Also, when in ft mode the slider value should show `5′10″` style display, not raw numbers.

---

## 4. Design System Gaps

| Gap | Location | Fix |
|---|---|---|
| Nav icons are placeholder squares | `app.css` + `app.js` | SVG icons per tab (see §5) |
| Meal ingredient category colour coding | `app.css` | Add `.ing-dot` system |
| Calorie number in phases has no emphasis | `phases.js` | Wrap in accent span |
| Onboarding step labels are not capitalised consistently | `i18n.js` | Minor copy edit |
| Splash "Let's build your plan" should scale to full viewport height | `onboarding.css` | Add `min-height: calc(100dvh - 80px)` flex centering to splash step |
| Language cards have no flag emoji or visual identity | `onboarding.js` step 0 | Add flag/emoji: 🇬🇧 / 🇮🇳 / 🟦 |
| Settings panel backdrop is `rgba(0,0,0,0.65)` but bottom sheet has no drag handle | `app.css` | Add 36×4px rounded pill drag handle at top |

---

## 5. SVG Nav Icons (exact shapes, copy-paste ready)

```js
const NAV_ICONS = {
  home:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  phases:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>`,
  meals:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18M9 3c0 5-3 7-3 9h6c0-2-3-4-3-9z"/><path d="M15 3v6m3-6v6m-1.5 0v12"/></svg>`,
  prep:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  grocery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  supps:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a4 4 0 018 0v4"/><line x1="12" y1="13" x2="12" y2="17"/></svg>`,
};
```

---

## 6. Performance Issues

| Issue | Impact | Fix |
|---|---|---|
| `sw.js` tries to cache `icon-192.png` and `icon-512.png` which don't exist | SW install fails silently, offline broken | Make cache list conditional OR add placeholder images |
| Every page re-renders full innerHTML on nav change | Minor on mobile | Not worth optimising now — app is small |
| `buildDayMeals()` called twice on home page load (once for today, once for render) | Negligible | Non-issue |

---

## 7. Accessibility Issues

| Issue | Fix |
|---|---|
| `axoSvg()` SVG has `aria-hidden="true"` ✅ | Already good |
| Language cards have no `aria-pressed` or `aria-selected` | Add `aria-pressed` on selection |
| Grocery items use `div` not `button` or `[role=checkbox]` | Change to `<label>` or add `role="checkbox" aria-checked` |
| Onboarding `option-big` buttons have no visible focus ring beyond browser default | Add `:focus-visible` outline to `.option-big` |
| Nav items have no `aria-current="page"` | Add when active |

---

## 8. Missing i18n Keys (will crash `t()` fallbacks)

| Key | Missing in |
|---|---|
| `grocery.cat_pantry` | All 3 languages |
| `settings.sub` | All 3 languages (optional but referenced) |
| `home.stats` (rendered in home.js via `t("phases.macros")` — wrong key) | The stat pill uses `plan.macro.protein` then appends `t("phases.macros").split(" ")[0]` — this only works if the string starts with "Macros" in EN; breaks in hi/gu |

---

## 9. Copy / Tone Issues

| Screen | Current | Better |
|---|---|---|
| Step 2 label | Renders `t("onb.q_name")` twice — once as `<h1>`, once as `<label>` text | Remove the redundant `<label>` line |
| Stat pill on home | Shows raw `g` then `t("phases.macros").split(" ")[0]` | Use dedicated `home.protein_label` key = "Protein" |
| Phases page title | Missing — page has no `<h2>` title | Add `<h2>${t("phases.title")}</h2>` |
| Settings sub-text | "Pick language" hardcoded, never translated | Translate or remove |

---

## 10. What "Done" Looks Like

The app is complete and polished when:

1. **No JS errors** in console on any step of onboarding and on any page of the main app
2. **Auto-advance** works on single-choice steps (goal, sex, activity, training days, diet type)
3. **Nav icons** are real SVGs — user can visually distinguish all 6 tabs
4. **Height step** has ft/in toggle with proper display
5. **Greeting** on home is large and personal, not dim subtext
6. **Phases page** shows calorie number in accent lime with macro badges
7. **Prep steps** are checkable
8. **Reset button** in settings works
9. **All text** in all 3 languages — including supplement names, slot labels, phase content
10. **Offline works** — SW installs without errors (placeholder icons exist or cache list is guarded)
11. **Zero hardcoded English strings** outside `i18n.js`

---

## 11. What NOT to Change

- The `generatePlan()` math is correct — TDEE, macros, phases all check out
- The `store.js` localStorage contract is exactly right
- The `sw.js` cache strategy (cache-first assets, network-first HTML) is correct
- The CSS design tokens are exactly the right values — do not alter colours or radii
- The 3-language structure in `i18n.js` is solid — only add missing keys, never restructure

---

## 12. The PR Task List (for the build agent)

**Read this section only** if you're the build agent. Do each PR in order. Each is self-contained.

---

### PR-1 — Critical Bug Fixes
**Branch:** `cursor/pr1-bug-fixes-45b7`

Files to change:
- `js/onboarding.js` line 69: fix syntax `${t("lang.gu")} གུজ્લિশ` (closing paren before space)
- `js/app.js`: add `setupSettings(); render();` at the very bottom of the file (after the SW register block)
- `js/i18n.js`: add `cat_pantry` to `grocery` in all 3 language blocks (`"Pantry"` / `"Pantry"` / `"Pantry"`)
- `js/pages/supps.js`: wrap all `LABEL[s.id]` values through `t()` OR move LABEL into i18n keys — add `supps.label_creatine`, `supps.label_whey`, etc. to all 3 language blocks

**Test:** Load `index.html`. Complete onboarding in all 3 languages. Confirm app.html shows home content immediately. Confirm Grocery Pantry tab shows correct label. Confirm Supps page shows names in the chosen language.

---

### PR-2 — Height ft/in Toggle + Step Copy Fix
**Branch:** `cursor/pr2-height-toggle-45b7`

Files to change:
- `js/onboarding.js` step 6: add `heightUnit` state variable (`cm` | `ft`). Add toggle UI (same pattern as weight). Convert between cm and ft+in for display. Store always in `height_cm`.
- `js/onboarding.js` step 2: remove the duplicate `<label>` that repeats the `<h1>` text
- Display format: when ft mode, show `5′10″` string from `Math.floor(cm/30.48)` and `Math.round((cm%30.48)/2.54)`

**Test:** Go to step 6. Toggle to ft. Slider shows 5′10″. Switch back to cm. Shows 177 cm. Tap Continue. Profile saves `height_cm` correctly.

---

### PR-3 — Auto-Advance Single-Choice Steps
**Branch:** `cursor/pr3-auto-advance-45b7`

Files to change:
- `js/onboarding.js` — in `wireStep()` for steps 3, 8, 9, 10, 11: after setting the data value and toggling `.selected`, add `setTimeout(() => advance(), 350)`

Implementation note: wrap in a `let advancing = false` guard to prevent double-fires if user taps twice quickly.

**Test:** Step 3 — tap "Build muscle." App auto-moves to step 4 after ~350ms. Step 10 — tap "4." App auto-moves to step 11. All 5 steps confirm.

---

### PR-4 — Nav Icons + Active State
**Branch:** `cursor/pr4-nav-icons-45b7`

Files to change:
- `js/app.js` — add the `NAV_ICONS` object (from §5 above) and render `NAV_ICONS[id]` instead of `<span class="nav-dot"></span>`
- `css/app.css` — update `.nav-dot` rule to `.nav-icon` for sizing: `width: 24px; height: 24px;`
- `css/app.css` — `.nav-item.active svg` → `stroke: var(--accent-lime)`
- `app.html` — update bottom nav `aria-label` on each button to include `aria-current` when active (done in `renderNav()`)

**Test:** All 6 tabs show distinct recognisable icons. Active tab icon is lime-coloured. Inactive are dim white.

---

### PR-5 — Home Page Redesign
**Branch:** `cursor/pr5-home-redesign-45b7`

Files to change:
- `js/pages/home.js` — restructure layout:
  1. Greeting: `<h1 class="greeting">{greeting}</h1>` — large, full white
  2. Stat row: remains but use dedicated `t("home.protein_label")` = "Protein" key
  3. Today's meals: each meal gets its own mini card (not a `<ul>`) with slot name, meal name, kcal badge
  4. Quick-nav cards: keep, but add the SVG icon inline in each card
- `js/i18n.js` — add `home.protein_label` = "Protein" / "Protein" / "Protein" to all 3 langs
- `css/app.css` — add `.greeting { font-size: 1.9rem; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 16px; }`

**Test:** Home page shows "Good morning, Rudra." in large white text. Stat pills show weight, duration, protein with correct label in all 3 languages.

---

### PR-6 — Phases Page Visual Upgrade
**Branch:** `cursor/pr6-phases-upgrade-45b7`

Files to change:
- `js/pages/phases.js` — redesign each phase card:
  - Add `<h2 class="step-title">Phase {p.index}</h2>` at top
  - Calorie line: `<div class="kcal-hero">{p.calories} <span>kcal</span></div>` — styled in lime
  - Macros: render as 3 side-by-side badges `P {n}g`, `F {n}g`, `C {n}g`
  - Focus + rotation lines remain but in `step-sub` colour
  - Add a phase header: `<p class="step-sub">{t("phases.weeks", {n: p.weeks})}</p>` before kcal
- `css/app.css` — add `.kcal-hero { font-size: 2.2rem; font-weight: 800; color: var(--accent-lime); line-height: 1; }` and `.macro-row { display: flex; gap: 8px; margin: 8px 0; }` with `.macro-badge` chip styling

**Test:** Phases page shows each phase with large lime calorie number. Three macro badges (P/F/C) side by side. Duration subtitle above.

---

### PR-7 — Ingredient Category Colour Dots + Meal Card Polish
**Branch:** `cursor/pr7-meal-cards-45b7`

Files to change:
- `css/app.css` — add category dot system:
  ```css
  .ing-cat-protein { color: var(--accent-teal); }
  .ing-cat-carbs   { color: var(--accent-lime); }
  .ing-cat-veg     { color: var(--accent-orange); }
  .ing-cat-dairy   { color: rgba(255,255,255,0.7); }
  .ing-cat-pantry  { color: rgba(255,255,255,0.4); }
  ```
- `js/pages/meals.js` — in ingredient list render, wrap each item:
  ```js
  `<li class="ing-cat-${ing.category}">${ing.name} <span style="opacity:0.6">— ${ing.grams}g</span></li>`
  ```
- Also: remove the redundant `<span class="tag">${t("meals.high_protein")}</span>` that appears on every single meal card (all meals are tagged high_protein — it adds no info)

**Test:** Meals page — chicken appears in teal, oats in lime, broccoli in orange. Ingredient amounts are slightly dimmed. No redundant "High protein" tag on every card.

---

### PR-8 — Prep Steps Checkable
**Branch:** `cursor/pr8-prep-checkable-45b7`

Files to change:
- `js/pages/prep.js` — rewrite to be interactive:
  - Add `np_prep_done` Set from localStorage
  - Each step is a clickable row (like grocery items)
  - Checked state: strikethrough + dim opacity
  - Save to `np_prep_done` on toggle
  - Add "Clear all" button at bottom
- `js/store.js` — add `getPrepDone()` / `setPrepDone()` helpers

**Test:** Prep page — tap step 1 "Bake chicken" → it dims and strikes through. Navigate away and back — state persists. "Clear all" resets all.

---

### PR-9 — Settings: Reset Button + Translation Fix
**Branch:** `cursor/pr9-settings-reset-45b7`

Files to change:
- `app.html` — add reset button in settings panel:
  ```html
  <button type="button" class="btn" id="settings-reset" style="border-color:var(--accent-orange);color:var(--accent-orange)">Reset &amp; restart</button>
  ```
- `js/app.js` — wire reset button: call `clearAll()` then `window.location.href = "index.html"`
- `js/i18n.js` — add `settings.reset` = "Reset & restart" / "Reset & restart" / "Reset & restart" to all 3 langs, and `settings.sub` = "Change language" / "Language badlo" / "Language badlo"
- `app.html` — update `<p class="step-sub" id="settings-sub">` to be translated on open
- `js/app.js` — in `setupSettings()` on open: also set `document.getElementById("settings-sub").textContent = t("settings.sub")`

**Test:** Open settings. Sub-text translates. Tap "Reset & restart" → redirects to `index.html` with clean localStorage.

---

### PR-10 — Onboarding Polish (Splash tap, language flags, Axo loading animation)
**Branch:** `cursor/pr10-onboarding-polish-45b7`

Files to change:
- `js/onboarding.js` step 1 (splash): add click listener on the whole `root` div (not just the button) to call `advance()`
- `js/onboarding.js` step 0 (language picker): add emoji to each card: 🇬🇧 English / 🇮🇳 Hinglish / 🟦 Gujlish (or use `IN` flag for both Indian languages)
- `js/onboarding.js` step 15 (loading): change Axo from floating bob to a `celebrate` CSS class:
  - Add `@keyframes axoCelebrate` to `components.css`: scale 1 → 1.15 → 1 over 600ms, repeat 3x
  - Apply class on loading screen only
- `css/components.css` — add `@keyframes axoCelebrate` and `.axo-celebrate` class
- `js/onboarding.js` — back button text: change `←` to `‹ Back` for clarity

**Test:** Splash — tap anywhere (not just button) → advances. Language cards show flags. Loading screen Axo pulses with celebration animation.

---

### PR-11 — Accessibility Pass
**Branch:** `cursor/pr11-a11y-45b7`

Files to change:
- `js/onboarding.js` — add `aria-pressed` to all `option-big` buttons based on selected state
- `js/pages/grocery.js` — change grocery item `<div>` to `<button>` with `role="checkbox"` and `aria-checked`
- `css/onboarding.css` — add `.option-big:focus-visible { outline: 2px solid var(--accent-teal); outline-offset: 3px; }`
- `js/app.js` in `renderNav()` — add `aria-current="page"` on active nav button
- `js/i18n.js` — verify all `aria-label` strings are translatable (back button, settings button)

**Test:** Tab through onboarding on desktop — all interactive elements have visible focus rings. Screen reader announces nav tab as "current page."

---

### PR-12 — Service Worker: Guard Missing Assets
**Branch:** `cursor/pr12-sw-guard-45b7`

Files to change:
- `sw.js` — wrap the `addAll()` in individual `cache.add()` calls with `.catch(() => {})` so a missing PNG does not kill the whole SW install. OR: add tiny 1×1 placeholder PNGs to `assets/axo/` and `assets/icons/` so the SW install succeeds.
- Recommended: add placeholder PNGs. Create `assets/icons/icon-192.png` and `icon-512.png` as 192×192 and 512×512 lime green squares with the Axo SVG drawn on them via a build script, OR add the inline SVG fallback as a data URI in `manifest.json` alternative.

Simplest fix — change `sw.js` `addAll` to individual adds:
```js
e.waitUntil(
  caches.open(CACHE).then(c =>
    Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})))
  )
);
```

**Test:** Open DevTools → Application → Service Workers → force update. No errors. App works offline after first load even without PNG assets.

---

## 13. PR Execution Order

```
PR-1  (bugs)          ← DO FIRST, unblocks everything
PR-2  (height toggle) ← can run in parallel with PR-3, PR-4
PR-3  (auto-advance)  ← can run in parallel
PR-4  (nav icons)     ← can run in parallel
PR-5  (home)          ← needs PR-1 done
PR-6  (phases)        ← needs PR-1 done
PR-7  (meal cards)    ← needs PR-1 done
PR-8  (prep check)    ← needs PR-1 done
PR-9  (settings)      ← needs PR-1 done
PR-10 (onboarding)    ← needs PR-1 done
PR-11 (a11y)          ← last, needs all UI stable
PR-12 (SW guard)      ← can run any time after PR-1
```

PRs 2–4 and 12 can all be opened simultaneously after PR-1 merges.
PRs 5–10 can all be opened simultaneously after PR-1 merges.
PR-11 should be last.

---

## 14. Files Changed Per PR (quick reference)

| PR | Files |
|---|---|
| 1 | `onboarding.js`, `app.js`, `i18n.js`, `supps.js` |
| 2 | `onboarding.js` |
| 3 | `onboarding.js` |
| 4 | `app.js`, `app.css`, `app.html` |
| 5 | `pages/home.js`, `i18n.js`, `app.css` |
| 6 | `pages/phases.js`, `app.css` |
| 7 | `pages/meals.js`, `app.css` |
| 8 | `pages/prep.js`, `store.js` |
| 9 | `app.html`, `app.js`, `i18n.js` |
| 10 | `onboarding.js`, `components.css` |
| 11 | `onboarding.js`, `pages/grocery.js`, `onboarding.css`, `app.js`, `i18n.js` |
| 12 | `sw.js` |

---

## 15. Summary for the Next Agent (Plain English)

**The app works but has 2 blockers that make it crash:**
1. Fix the syntax error in `onboarding.js` line 69 (missing closing parenthesis on `t()`)
2. Add `setupSettings(); render();` at the bottom of `app.js`

**After those 2 fixes, the app runs.** Then do the polish in this order:
1. Add real SVG icons to the bottom nav (not grey squares)
2. Make single-choice quiz steps auto-advance (no extra "Continue" tap)
3. Add ft/in toggle to the height step
4. Make the home greeting large and prominent
5. Style phase cards with big lime calorie number and macro badges
6. Colour-code meal ingredients by food category
7. Make prep steps checkable (like grocery)
8. Add a "Reset & restart" button in settings
9. Fix the service worker to not break on missing PNG files
10. Run an accessibility pass (aria attributes, focus rings)

Every change is described with exact file, exact line, and test criteria above.

---

*Plan v3 — full code audit, May 2026. All findings based on reading every file in the repo.*
