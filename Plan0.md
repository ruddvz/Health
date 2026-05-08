# HEALTH PWA — Complete Build Blueprint

### Version 1.0 | Offline-First | No Backend | PWA (Mobile + Desktop)

-----

## TABLE OF CONTENTS

1. [Project Vision](#1-project-vision)
1. [Architecture Overview](#2-architecture-overview)
1. [File Structure](#3-file-structure)
1. [Design System](#4-design-system)
1. [PWA Setup & Manifest](#5-pwa-setup--manifest)
1. [Data Layer — localStorage Schema](#6-data-layer--localstorage-schema)
1. [Screen Inventory & UX Flows](#7-screen-inventory--ux-flows)
1. [Feature Modules — Detailed Specs](#8-feature-modules--detailed-specs)
- 8.1 Dashboard / Home
- 8.2 Meal Planner
- 8.3 Supplement Tracker
- 8.4 Grocery List
- 8.5 Workout Log
- 8.6 Water & Habit Tracker
- 8.7 Body Stats & Progress
- 8.8 Settings & Profile
1. [Complete Meal Plan Library](#9-complete-meal-plan-library)
1. [Complete Supplement Stack Library](#10-complete-supplement-stack-library)
1. [Complete Grocery List System](#11-complete-grocery-list-system)
1. [Pixel-Perfect UI Specs](#12-pixel-perfect-ui-specs)
1. [Mobile PWA Checklist](#13-mobile-pwa-checklist)
1. [Desktop PWA Checklist](#14-desktop-pwa-checklist)
1. [Accessibility & Performance](#15-accessibility--performance)
1. [Build Order — Step by Step](#16-build-order--step-by-step)
1. [Testing Checklist](#17-testing-checklist)

-----

## 1. PROJECT VISION

A **100% offline, device-only** Progressive Web App for personal health tracking. No server. No accounts. No API calls. Everything lives in `localStorage` and is fully functional after the first load.

### Core Principles

- **Offline-first**: Works entirely without internet after install. Service Worker caches all assets.
- **Device-only**: All data stays on the user’s device. No cloud sync, no backend, no analytics.
- **PWA installable**: Installs as a native-like app on iOS Safari, Android Chrome, macOS, and Windows.
- **No fake UI**: Every button, form, and list must actually work and persist data.
- **Polished**: Premium health app aesthetic. Not a demo — a finished product.

### Target User

Someone managing their daily health routine: meals, supplements, workouts, water, body stats. They want a clean, fast, private app that works on their phone or desktop without needing Wi-Fi or an account.

-----

## 2. ARCHITECTURE OVERVIEW

```
Single HTML file (index.html)  OR  Vanilla JS multi-page SPA
     |
     ├── manifest.json          (PWA manifest)
     ├── sw.js                  (Service Worker — full offline cache)
     ├── icons/                 (PWA icon set — all sizes)
     ├── css/
     │   ├── tokens.css         (design tokens — all variables)
     │   ├── base.css           (reset, typography, globals)
     │   ├── components.css     (buttons, cards, inputs, modals)
     │   └── screens.css        (per-screen layout rules)
     └── js/
         ├── app.js             (router, init, navigation)
         ├── store.js           (localStorage abstraction layer)
         ├── data/
         │   ├── meals.js       (all meal plan data)
         │   ├── supplements.js (all supplement data)
         │   └── groceries.js   (all grocery category data)
         └── screens/
             ├── dashboard.js
             ├── meals.js
             ├── supplements.js
             ├── grocery.js
             ├── workout.js
             ├── habits.js
             ├── stats.js
             └── settings.js
```

**Recommended approach**: Start as a single `index.html` for simplicity, then extract into modules. The Service Worker caches the single file and all assets on install.

**Tech stack**: Pure HTML5 + CSS3 + Vanilla JavaScript (ES6+). No React, no Vue, no build step required. Works by opening the file in any browser.

-----

## 3. FILE STRUCTURE

```
health-app/
├── index.html
├── manifest.json
├── sw.js
├── offline.html
├── icons/
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   ├── icon-512.png
│   └── maskable-512.png       (safe zone padding for maskable)
├── screenshots/
│   ├── mobile-home.png        (for PWA install prompt)
│   └── desktop-home.png
└── assets/
    └── sounds/
        └── tick.mp3           (optional: habit completion tick)
```

-----

## 4. DESIGN SYSTEM

### 4.1 Color Palette

```css
:root {
  /* Background layers */
  --bg-base:        #0A0F0D;   /* deepest background */
  --bg-surface:     #111A15;   /* card backgrounds */
  --bg-elevated:    #182218;   /* modals, sheets */
  --bg-overlay:     #1E2B1E;   /* hover states */

  /* Brand — deep forest green */
  --accent-primary:   #3DDB7A;  /* CTAs, active states */
  --accent-secondary: #2AB862;  /* secondary actions */
  --accent-dim:       #1A6B3A;  /* muted accents */
  --accent-glow:      rgba(61, 219, 122, 0.18);

  /* Text */
  --text-primary:   #F2F7F4;
  --text-secondary: #8FA897;
  --text-muted:     #4D6357;
  --text-inverse:   #0A0F0D;

  /* Semantic */
  --color-success: #3DDB7A;
  --color-warning: #F5A623;
  --color-danger:  #FF4D4D;
  --color-info:    #4DA6FF;

  /* Borders */
  --border-subtle:   rgba(61, 219, 122, 0.08);
  --border-default:  rgba(61, 219, 122, 0.16);
  --border-strong:   rgba(61, 219, 122, 0.32);

  /* Shadows */
  --shadow-card:   0 4px 24px rgba(0,0,0,0.4);
  --shadow-modal:  0 16px 64px rgba(0,0,0,0.7);
  --shadow-glow:   0 0 32px rgba(61, 219, 122, 0.2);
}
```

### 4.2 Typography

```css
/* Import in <head> */
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --font-display:  'Clash Display', sans-serif;
  --font-body:     'DM Sans', sans-serif;

  /* Scale */
  --text-xs:    11px;
  --text-sm:    13px;
  --text-base:  15px;
  --text-md:    17px;
  --text-lg:    20px;
  --text-xl:    24px;
  --text-2xl:   30px;
  --text-3xl:   38px;
  --text-4xl:   48px;

  /* Line heights */
  --leading-tight:  1.15;
  --leading-snug:   1.35;
  --leading-normal: 1.55;
  --leading-loose:  1.75;
}
```

### 4.3 Spacing & Radius

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-full: 9999px;
}
```

### 4.4 Component Tokens

```css
/* Bottom nav height */
--nav-height-mobile: 72px;
--nav-height-desktop: 64px;

/* Safe area insets (iOS notch/home bar) */
--safe-top:    env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left:   env(safe-area-inset-left, 0px);
--safe-right:  env(safe-area-inset-right, 0px);

/* Cards */
--card-padding-mobile:  16px;
--card-padding-desktop: 24px;
```

-----

## 5. PWA SETUP & MANIFEST

### 5.1 manifest.json (complete)

```json
{
  "name": "Health — Personal Tracker",
  "short_name": "Health",
  "description": "Your offline-first personal health companion. Meals, supplements, workouts, and habits — all on your device.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "background_color": "#0A0F0D",
  "theme_color": "#3DDB7A",
  "orientation": "portrait-primary",
  "lang": "en",
  "categories": ["health", "fitness", "lifestyle"],
  "icons": [
    { "src": "icons/icon-72.png",     "sizes": "72x72",   "type": "image/png" },
    { "src": "icons/icon-96.png",     "sizes": "96x96",   "type": "image/png" },
    { "src": "icons/icon-128.png",    "sizes": "128x128", "type": "image/png" },
    { "src": "icons/icon-144.png",    "sizes": "144x144", "type": "image/png" },
    { "src": "icons/icon-152.png",    "sizes": "152x152", "type": "image/png" },
    { "src": "icons/icon-192.png",    "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-384.png",    "sizes": "384x384", "type": "image/png" },
    { "src": "icons/icon-512.png",    "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/maskable-512.png","sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    {
      "src": "screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Dashboard"
    },
    {
      "src": "screenshots/desktop-home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard on desktop"
    }
  ],
  "shortcuts": [
    { "name": "Log Meal",       "url": "/?screen=meals",       "icons": [{"src":"icons/icon-96.png","sizes":"96x96"}] },
    { "name": "Log Workout",    "url": "/?screen=workout",     "icons": [{"src":"icons/icon-96.png","sizes":"96x96"}] },
    { "name": "Supplements",    "url": "/?screen=supplements", "icons": [{"src":"icons/icon-96.png","sizes":"96x96"}] }
  ],
  "prefer_related_applications": false
}
```

### 5.2 Service Worker (sw.js) — Full Offline Cache

```javascript
const CACHE_NAME = 'health-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap'
];

// Install: cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for dynamic
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});
```

### 5.3 Register Service Worker in index.html

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW failed:', err));
    });
  }
</script>
```

### 5.4 iOS Safari Meta Tags (REQUIRED for iOS PWA)

```html
<!-- PWA iOS -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Health">
<link rel="apple-touch-icon" href="icons/icon-152.png">
<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-192.png">

<!-- Viewport — critical for PWA -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Theme color -->
<meta name="theme-color" content="#3DDB7A" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#2AB862" media="(prefers-color-scheme: light)">
```

-----

## 6. DATA LAYER — localStorage SCHEMA

All data is stored under the `health_app_` prefix in localStorage. Use a store abstraction:

```javascript
// store.js
const STORE_KEY = 'health_app_data';

const defaultState = {
  profile: {
    name: '',
    dob: '',
    sex: 'male',
    heightCm: 0,
    weightKg: 0,
    goalWeight: 0,
    activityLevel: 'moderate',
    goal: 'maintain',    // 'lose' | 'maintain' | 'gain'
    tdee: 0,
    bmr: 0
  },
  meals: {
    log: [],             // { id, date, mealType, items[], calories, notes }
    plans: [],           // { id, name, days: [{breakfast,lunch,dinner,snacks}] }
    activePlan: null,
    favorites: []
  },
  supplements: {
    stack: [],           // { id, name, dose, unit, timing, notes, active }
    log: []              // { id, date, supplementId, taken: bool, time }
  },
  grocery: {
    lists: [],           // { id, name, createdAt, items[] }
    activeListId: null,
    templates: []        // preset grocery templates
  },
  workout: {
    log: [],             // { id, date, type, exercises[], duration, notes }
    programs: [],        // { id, name, days: [{exercises[]}] }
    activeProgram: null,
    exercises: []        // custom exercise library
  },
  habits: {
    habits: [],          // { id, name, icon, color, frequency, streak, completions[] }
    waterLog: []         // { date, glasses }
  },
  stats: {
    bodyWeight: [],      // { date, value }
    bodyFat: [],
    measurements: []     // { date, chest, waist, hips, arms, thighs }
  },
  settings: {
    theme: 'dark',
    units: 'metric',
    waterGoal: 8,
    calorieGoal: 2000,
    notifications: false,
    weekStart: 'monday',
    currency: 'CAD'
  }
};

export const store = {
  get() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
    } catch { return { ...defaultState }; }
  },
  set(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  },
  update(path, value) {
    const state = this.get();
    // deep set by dot path e.g. 'profile.name'
    const keys = path.split('.');
    let ref = state;
    keys.slice(0, -1).forEach(k => ref = ref[k]);
    ref[keys[keys.length - 1]] = value;
    this.set(state);
    return state;
  },
  reset() {
    localStorage.removeItem(STORE_KEY);
  },
  export() {
    return JSON.stringify(this.get(), null, 2);
  },
  import(json) {
    try {
      const data = JSON.parse(json);
      this.set({ ...defaultState, ...data });
      return true;
    } catch { return false; }
  }
};
```

-----

## 7. SCREEN INVENTORY & UX FLOWS

### Navigation Structure

```
Bottom Tab Bar (mobile) / Left Sidebar (desktop 1024px+)
├── Home (Dashboard)        → icon: grid-2x2
├── Meals                   → icon: utensils
├── Supplements             → icon: pill
├── Grocery                 → icon: shopping-cart
├── Workout                 → icon: dumbbell
├── Habits                  → icon: check-circle
├── Stats                   → icon: trending-up
└── Settings                → icon: sliders
```

### Mobile Navigation Rules

- Bottom nav bar: fixed, 72px tall, safe-area-inset-bottom aware
- Active tab has green accent dot + label visible
- Inactive tabs show icon only on very small screens (< 360px)
- Haptic feedback on tab switch (if `navigator.vibrate` available)

### Desktop Navigation Rules

- Left sidebar: 240px wide, always visible at 1024px+
- Collapses to 64px icon-only sidebar on 768–1024px
- Main content area has max-width: 1200px, centered

### Screen Transitions

- Slide left/right between tabs (CSS transform, 250ms ease)
- Slide up for modals/detail views
- Fade for overlays

-----

## 8. FEATURE MODULES — DETAILED SPECS

-----

### 8.1 DASHBOARD / HOME

**Purpose**: At-a-glance view of today’s status across all modules.

**Layout (top to bottom)**:

1. **Header**: “Good morning, [name]” + date + streak badge
1. **Calorie Ring**: Animated donut chart — consumed vs. goal. Center shows remaining.
1. **Quick-Log Row**: 4 icon buttons — “Log Meal”, “Log Water”, “Log Workout”, “Take Supplement”
1. **Today’s Meal Plan Card**: Shows breakfast/lunch/dinner from active plan. Tap to go to Meals.
1. **Supplement Check-In**: Horizontal scroll of today’s supplements — tap to mark taken.
1. **Habit Rings**: Row of circular habit completion rings for today.
1. **Water Progress**: Animated horizontal bar — glasses filled today vs. goal.
1. **Workout Card**: Today’s scheduled workout from active program. “Start” button.
1. **Body Weight Sparkline**: 7-day weight trend (tiny line chart, no axes).
1. **Motivation Quote**: Random daily quote from preset list (20 quotes, rotates by day of year).

**Interactions**:

- Quick-log buttons open bottom-sheet modals (not full page navigation)
- Supplement chips toggle between “pending” and “taken” with animation
- Habit rings animate completion fill on tap
- Pull-to-refresh updates date/calculations
- Water “+” button increments glasses count

-----

### 8.2 MEAL PLANNER

**Tabs**: Today | Plans | Log | Favorites

#### Today Tab

- Shows today’s meals based on active plan day
- Each meal slot (Breakfast / Lunch / Dinner / Snack) is a card
- Cards show: meal name, calories, macros (P/C/F)
- Tap card → meal detail sheet (ingredients, instructions, nutrition)
- “Log it” button marks meal as eaten and adds to calorie count
- “Swap” button opens meal selector from plan library

#### Plans Tab

- List of all saved meal plans + “Add Plan” button
- Each plan shows: name, days, avg calories/day
- Tap → plan detail (edit days/meals)
- “Set Active” button
- Built-in plan templates from the library (Section 9)

#### Log Tab

- Full history of logged meals, grouped by date
- Each entry: meal name, time, calories, meal type badge
- Swipe-to-delete (with undo toast)
- Search/filter by date range or meal type

#### Favorites Tab

- Meals marked as favorite across all plans
- One-tap “Quick Add to Today” from here

**Add/Edit Meal Modal**:

```
Fields:
- Meal Name (text)
- Meal Type (segmented: Breakfast / Lunch / Dinner / Snack)
- Calories (number)
- Protein (g), Carbs (g), Fat (g) — optional
- Notes / Instructions (textarea)
- Servings (number, default 1)
```

-----

### 8.3 SUPPLEMENT TRACKER

**Tabs**: Today | My Stack | Log | Library

#### Today Tab

- Vertical list of all active supplements for today
- Each row: supplement name, dose, timing tag (morning/pre-workout/evening)
- Checkbox with animated check → marks taken, logs timestamp
- Color-coded timing badges
- Progress bar: X of Y taken today

#### My Stack Tab

- Full list of supplements in personal stack
- Each item: name, dose, unit, timing, notes, active toggle
- “Add Supplement” button → opens add modal
- Edit/delete per item
- Reorder via drag handles

#### Log Tab

- Calendar view of past supplement adherence
- Day cells show % taken (green = 100%, yellow = partial, red = 0%)
- Tap day → detail of what was taken/missed

#### Library Tab

- Pre-loaded supplement library with 80+ common supplements
- Organized by category: Vitamins, Minerals, Performance, Recovery, Health
- Tap any to add to your stack (pre-fills dose/timing)
- Search bar

**Add Supplement Modal**:

```
Fields:
- Name (text + autocomplete from library)
- Dose amount (number)
- Unit (mg, mcg, g, IU, ml, capsule)
- Timing (multi-select: Morning / Pre-Workout / With Lunch / Evening / Before Bed)
- Days (all / weekdays / weekends / custom)
- Notes
```

-----

### 8.4 GROCERY LIST

**Tabs**: Current List | Lists | Templates

#### Current List Tab

- Active grocery list — grouped by category (Produce, Protein, Dairy, Pantry, etc.)
- Each item: name, quantity, unit, category color dot
- Checkbox → strikethrough animation when item purchased
- “Clear Checked” button removes completed items
- Add item: FAB button at bottom right
- Quick-add bar at top: type item name + Enter
- “Share as Text” button copies list to clipboard (for messaging)
- “Generate from Meal Plan” button auto-populates list from active plan

#### Lists Tab

- All saved lists (history)
- Create new list button
- Switch active list
- Delete/archive old lists

#### Templates Tab

- Pre-built grocery templates from library (Section 11)
- Tap template → preview, then “Import to List”

**Add Item Modal**:

```
Fields:
- Item name (text + autocomplete from grocery database)
- Quantity (number)
- Unit (pieces, g, kg, ml, L, cups, tbsp)
- Category (auto-detected, overridable)
- Notes (e.g., "organic", "check if ripe")
```

-----

### 8.5 WORKOUT LOG

**Tabs**: Today | Programs | History | Exercises

#### Today Tab

- Today’s workout from active program
- Exercise cards: name, sets×reps, weight, notes
- “Start Workout” → workout timer mode:
  - Large timer at top
  - Exercise list below
  - Each set has checkboxes
  - Rest timer pops up between sets
  - “Finish Workout” saves to log

#### Programs Tab

- List of saved programs (e.g., PPL, 5/3/1, HIIT 4-Day)
- Each shows: name, days/week, type (strength/cardio/mixed)
- Tap → edit program (add/remove/reorder exercises per day)
- “Set Active” button

#### History Tab

- Chronological log of completed workouts
- Each entry: date, program name, duration, total volume
- Tap → full workout detail (all sets, weights, notes)
- Weekly volume chart (bar chart by week)

#### Exercises Tab

- Exercise library (100+ exercises, filterable by muscle group)
- Equipment filter: Barbell, Dumbbell, Cable, Bodyweight, Machine
- Muscle filter: Chest, Back, Legs, Shoulders, Arms, Core
- Add custom exercise button

-----

### 8.6 WATER & HABIT TRACKER

**Section A: Water Tracker**

- Large animated water glass visualization
- Tap “+” or individual glass icons to log a glass (250ml default)
- Daily goal (configurable in settings, default 8 glasses)
- Progress: “6 of 8 glasses — 500ml remaining”
- Week view: small glasses per day (scroll back 7 days)
- Custom cup size setting (250ml / 355ml / 500ml)

**Section B: Habit Tracker**

- Grid of habits with circular progress rings
- Each habit: icon, name, streak count
- Tap ring to toggle complete for today
- Long-press → edit habit
- Streak calendar: 90-day heatmap per habit (tap to see)

**Add Habit Modal**:

```
Fields:
- Name
- Icon (grid of 30 emojis to pick)
- Color (8 presets)
- Frequency (Daily / Weekdays / Weekends / Custom days)
- Reminder time (optional — uses Web Notifications API)
- Target (e.g., "30 minutes", "3 sets" — just a label)
```

-----

### 8.7 BODY STATS & PROGRESS

**Tabs**: Overview | Weight | Measurements | Photos

#### Overview Tab

- Current stats summary card: Height, Weight, BMI, Body Fat%
- Goal progress: current → target weight with % complete bar
- TDEE estimate (calculated from profile data)
- Macro targets (from TDEE + goal type)

#### Weight Tab

- Line chart: weight over selected time range (7d / 30d / 90d / All)
- Log today’s weight: large input with current value pre-filled
- Moving average overlay toggle
- Goal weight line on chart

#### Measurements Tab

- Body measurement log: Chest, Waist, Hips, Arms (R/L), Thighs (R/L)
- Table view of history
- Line chart per measurement
- “Log measurements” button

#### Photos Tab

- Progress photo grid (front, side, back)
- Uses device camera via `<input type="file" accept="image/*" capture="user">`
- Photos stored as base64 in localStorage (warn user about storage limits)
- Side-by-side comparison view (pick 2 dates)

**BMI & TDEE Calculations**:

```javascript
// BMI
const bmi = weightKg / (heightM ** 2);

// BMR (Mifflin-St Jeor)
const bmrMale   = 10 * kg + 6.25 * cm - 5 * age + 5;
const bmrFemale = 10 * kg + 6.25 * cm - 5 * age - 161;

// TDEE
const activityMultipliers = {
  sedentary:    1.2,
  light:        1.375,
  moderate:     1.55,
  active:       1.725,
  very_active:  1.9
};
const tdee = bmr * activityMultipliers[activityLevel];

// Macro split (based on goal)
const macros = {
  lose:     { protein: 0.40, carbs: 0.30, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain:     { protein: 0.30, carbs: 0.45, fat: 0.25 }
};
```

-----

### 8.8 SETTINGS & PROFILE

**Sections**:

1. **Profile**: Name, DOB, Sex, Height, Weight, Activity Level, Goal
1. **App Preferences**: Theme (Dark/Light/Auto), Units (Metric/Imperial), Week start
1. **Goals**: Calorie goal, Water goal, custom macro override
1. **Notifications**: Toggle (requests permission), reminder times
1. **Data Management**:
- Export All Data (downloads `health-backup.json`)
- Import Data (file picker for JSON)
- Clear All Data (confirmation modal with typed “DELETE” confirm)
1. **PWA Install**: Shows “Install App” button if not installed yet
1. **About**: Version, changelog, how data is stored (privacy note)

-----

## 9. COMPLETE MEAL PLAN LIBRARY

All plans are stored as static JS data in `meals.js`. Users can use these as templates or build their own.

-----

### PLAN 1: High-Protein Fat Loss (1,800 kcal/day)

**Target**: Caloric deficit, 40% protein

#### Day 1

|Meal     |Item                                                          |Cal      |P       |C      |F      |
|---------|--------------------------------------------------------------|---------|--------|-------|-------|
|Breakfast|4 egg whites + 2 whole eggs scrambled + 1 cup spinach         |270      |31g     |4g     |13g    |
|Lunch    |200g grilled chicken breast + 150g brown rice + salad         |480      |48g     |45g    |8g     |
|Snack    |1 cup Greek yogurt (0% fat) + 1 tbsp honey + 10 almonds       |220      |18g     |26g    |5g     |
|Dinner   |200g salmon fillet + 1 cup steamed broccoli + 1 tbsp olive oil|420      |44g     |10g    |22g    |
|Snack    |1 scoop whey protein + water                                  |120      |25g     |3g     |2g     |
|**Total**|                                                              |**1,510**|**166g**|**88g**|**50g**|

#### Day 2

|Meal     |Item                                                                      |Cal      |P       |C       |F      |
|---------|--------------------------------------------------------------------------|---------|--------|--------|-------|
|Breakfast|Overnight oats: 80g oats + 1 scoop protein + almond milk                  |380      |32g     |46g     |8g     |
|Lunch    |Turkey wrap: 180g turkey breast + whole wheat tortilla + veggies + mustard|460      |46g     |38g     |9g     |
|Snack    |200g cottage cheese + 1 cup blueberries                                   |200      |24g     |22g     |2g     |
|Dinner   |200g lean beef (95%) + roasted bell peppers + zucchini + tomato sauce     |420      |42g     |20g     |18g    |
|**Total**|                                                                          |**1,460**|**144g**|**126g**|**37g**|

#### Day 3

|Meal     |Item                                                                            |Cal      |P       |C      |F      |
|---------|--------------------------------------------------------------------------------|---------|--------|-------|-------|
|Breakfast|3 whole eggs omelette + 50g feta + cherry tomatoes + black coffee               |320      |26g     |6g     |21g    |
|Lunch    |Large tuna salad: 180g canned tuna + avocado + mixed greens + olive oil dressing|440      |44g     |8g     |25g    |
|Snack    |1 scoop whey + 1 banana                                                         |210      |26g     |28g    |2g     |
|Dinner   |2 tilapia fillets (200g) + 1 cup quinoa + asparagus                             |480      |52g     |40g    |10g    |
|**Total**|                                                                                |**1,450**|**148g**|**82g**|**58g**|


> Repeat Day 1–3 pattern for 7 days, cycling through variety.

-----

### PLAN 2: Clean Bulk (2,800 kcal/day)

**Target**: Lean muscle gain, moderate surplus

#### Day 1

|Meal        |Item                                                              |Cal      |P       |C       |F      |
|------------|------------------------------------------------------------------|---------|--------|--------|-------|
|Breakfast   |4 whole eggs + 100g oats + 1 banana + 1 tbsp peanut butter        |680      |35g     |78g     |22g    |
|Lunch       |250g chicken thigh + 200g sweet potato + 150g broccoli + olive oil|620      |44g     |56g     |18g    |
|Pre-WO Snack|1 scoop whey + 1 cup rice cakes + 1 tbsp honey                    |320      |27g     |50g     |3g     |
|Dinner      |250g lean ground beef (90%) + 200g pasta + marinara + parmesan    |780      |52g     |88g     |24g    |
|Evening     |250g Greek yogurt + 30g granola + 15g chia seeds                  |360      |22g     |40g     |12g    |
|**Total**   |                                                                  |**2,760**|**180g**|**312g**|**79g**|

-----

### PLAN 3: Vegetarian (2,000 kcal/day)

#### Day 1

|Meal     |Item                                                             |Cal      |
|---------|-----------------------------------------------------------------|---------|
|Breakfast|Tofu scramble (200g firm tofu) + spinach + bell pepper + turmeric|280      |
|Lunch    |Lentil soup (1.5 cups) + 2 slices whole wheat bread + side salad |480      |
|Snack    |30g mixed nuts + 1 apple                                         |220      |
|Dinner   |Paneer tikka masala (150g paneer) + 150g basmati rice            |640      |
|Snack    |1 cup edamame + green tea                                        |180      |
|**Total**|                                                                 |**1,800**|

-----

### PLAN 4: Keto / Low-Carb (1,800 kcal, <30g net carbs)

#### Day 1

|Meal     |Item                                                               |Cal      |P       |C      |F       |
|---------|-------------------------------------------------------------------|---------|--------|-------|--------|
|Breakfast|3 eggs + 3 strips bacon + 1/4 avocado + black coffee               |480      |28g     |4g     |38g     |
|Lunch    |Chicken Caesar salad (200g chicken, romaine, parmesan, no croutons)|420      |44g     |6g     |24g     |
|Snack    |30g macadamia nuts + 2 string cheese                               |280      |10g     |4g     |24g     |
|Dinner   |250g ribeye steak + roasted asparagus + butter                     |580      |48g     |6g     |40g     |
|**Total**|                                                                   |**1,760**|**130g**|**20g**|**126g**|

-----

### PLAN 5: 5-Day Meal Prep Plan (Batch cooking)

**Sunday prep** → covers Mon–Fri lunch and dinner:

**Batch cook list**:

- 1.5 kg chicken breast (bake at 200°C, 22 min, season: garlic, paprika, salt)
- 500g brown rice (cook in rice cooker)
- 400g broccoli + 400g bell peppers (roast at 220°C, 20 min)
- 6 hard-boiled eggs
- 500g ground turkey (cook with taco seasoning — use in 2 dinners)
- 500g Greek yogurt containers (pre-portioned snacks)

**Mon–Fri Lunch (same base, different sauce)**:

- Mon: Chicken + rice + broccoli + teriyaki sauce
- Tue: Chicken + rice + peppers + salsa
- Wed: Ground turkey rice bowl + guac
- Thu: Chicken + rice + broccoli + pesto
- Fri: Turkey bowl + sriracha mayo

-----

### PLAN 6: Anti-Inflammatory Diet

**Principles**: Omega-3 rich, anti-oxidant dense, low processed sugar

#### Sample Day

|Meal     |Item                                                                          |
|---------|------------------------------------------------------------------------------|
|Breakfast|Smoothie: spinach + blueberries + turmeric + ginger + almond milk + flax seeds|
|Lunch    |Wild salmon + quinoa + cucumber salad + olive oil + lemon                     |
|Snack    |Walnuts + green tea                                                           |
|Dinner   |Grilled sardines + roasted beets + arugula + pomegranate seeds + EVOO         |

-----

### PLAN 7: Intermittent Fasting 16:8

**Eating window**: 12pm–8pm

|Meal  |Time   |Item                                             |
|------|-------|-------------------------------------------------|
|Meal 1|12:00pm|3 eggs + avocado toast + salad                   |
|Meal 2|3:30pm |Protein shake + fruit                            |
|Meal 3|7:30pm |Large dinner: protein + complex carb + vegetables|

-----

## 10. COMPLETE SUPPLEMENT STACK LIBRARY

Stored in `supplements.js` as an array of objects with metadata.

```javascript
// Each entry format:
// { id, name, category, defaultDose, unit, timing, benefits, notes, caution }
```

-----

### CATEGORY: VITAMINS

|Name             |Default Dose|Unit   |Timing           |Benefits                         |
|-----------------|------------|-------|-----------------|---------------------------------|
|Vitamin D3       |2000–5000   |IU     |Morning with fat |Immunity, bone health, mood      |
|Vitamin K2 (MK-7)|100         |mcg    |Morning with fat |Bone density, cardiovascular     |
|Vitamin C        |500–1000    |mg     |Any time         |Antioxidant, immunity, collagen  |
|Vitamin B12      |500–1000    |mcg    |Morning          |Energy, neurological function    |
|Vitamin B Complex|1           |capsule|Morning with food|Energy metabolism, nervous system|
|Folate (B9)      |400         |mcg    |Morning          |Cell division, DNA synthesis     |
|Vitamin A        |2500–5000   |IU     |With meal        |Vision, immunity, skin           |
|Vitamin E        |200–400     |IU     |With meal        |Antioxidant, skin health         |

-----

### CATEGORY: MINERALS

|Name                    |Default Dose|Unit|Timing        |Benefits                             |
|------------------------|------------|----|--------------|-------------------------------------|
|Magnesium Glycinate     |300–400     |mg  |Evening       |Sleep, muscle recovery, stress       |
|Zinc Bisglycinate       |15–30       |mg  |Evening       |Testosterone, immunity, wound healing|
|Iron (only if deficient)|18          |mg  |Morning fasted|Blood health, energy                 |
|Calcium Citrate         |500         |mg  |With meals    |Bone health                          |
|Potassium               |99          |mg  |With meal     |Electrolytes, blood pressure         |
|Selenium                |100–200     |mcg |With meal     |Thyroid, antioxidant                 |
|Chromium Picolinate     |200         |mcg |With meal     |Blood sugar regulation               |
|Iodine                  |150         |mcg |Morning       |Thyroid function                     |

-----

### CATEGORY: PERFORMANCE / PRE-WORKOUT

|Name                    |Default Dose|Unit |Timing              |Benefits                               |
|------------------------|------------|-----|--------------------|---------------------------------------|
|Creatine Monohydrate    |5           |g    |Any time (daily)    |Strength, power output, recovery       |
|Caffeine                |150–200     |mg   |30min pre-workout   |Energy, focus, endurance               |
|L-Citrulline            |6–8         |g    |30–60min pre-workout|Pump, blood flow, endurance            |
|Beta-Alanine            |3.2         |g    |Pre-workout         |Muscular endurance (may cause tingling)|
|L-Arginine              |3–6         |g    |Pre-workout         |Nitric oxide, pump                     |
|BCAAs (2:1:1)           |10          |g    |During workout      |Muscle protein synthesis               |
|EAAs                    |10          |g    |During/post workout |Complete amino acid profile            |
|Pre-Workout (all-in-one)|1           |scoop|20–30min pre        |Varies by formula                      |

-----

### CATEGORY: RECOVERY / POST-WORKOUT

|Name                            |Default Dose|Unit|Timing                    |Benefits                            |
|--------------------------------|------------|----|--------------------------|------------------------------------|
|Whey Protein Isolate            |25–30       |g   |Post-workout              |Muscle protein synthesis            |
|Casein Protein                  |30          |g   |Before bed                |Slow-release muscle recovery        |
|L-Glutamine                     |5           |g   |Post-workout or before bed|Gut health, recovery                |
|Tart Cherry Extract             |480         |mg  |Post-workout              |DOMS reduction, anti-inflammatory   |
|Omega-3 (EPA+DHA)               |2000–3000   |mg  |With meal                 |Inflammation, joints, cardiovascular|
|Collagen Peptides               |10          |g   |Any time                  |Joints, skin, gut                   |
|HMB (β-Hydroxy β-methylbutyrate)|3           |g   |Post-workout              |Muscle preservation                 |

-----

### CATEGORY: HEALTH & LONGEVITY

|Name                             |Default Dose|Unit       |Timing                  |Benefits                          |
|---------------------------------|------------|-----------|------------------------|----------------------------------|
|Ashwagandha (KSM-66)             |300–600     |mg         |Evening                 |Cortisol, stress, testosterone    |
|Rhodiola Rosea                   |200–400     |mg         |Morning                 |Adaptogen, mental fatigue, stress |
|Lion’s Mane Mushroom             |500–1000    |mg         |Morning                 |Cognition, nerve growth factor    |
|Berberine                        |500         |mg         |With meal               |Blood sugar, metabolic health     |
|NMN (Nicotinamide Mononucleotide)|250–500     |mg         |Morning fasted          |NAD+ precursor, cellular energy   |
|Resveratrol                      |250–500     |mg         |With meal               |Antioxidant, longevity            |
|CoQ10                            |100–200     |mg         |With meal (fat)         |Heart health, energy, mitochondria|
|Alpha Lipoic Acid                |300–600     |mg         |With meal               |Antioxidant, insulin sensitivity  |
|Probiotics                       |10–50       |billion CFU|Morning fasted          |Gut microbiome                    |
|Digestive Enzymes                |1           |capsule    |Before meals            |Digestion, bloating               |
|Turmeric + BioPerine             |500–1000    |mg         |With meal               |Anti-inflammatory                 |
|Melatonin                        |0.5–3       |mg         |30min before bed        |Sleep onset                       |
|L-Theanine                       |100–200     |mg         |With caffeine or evening|Calm focus, sleep quality         |
|5-HTP                            |50–100      |mg         |Evening                 |Serotonin precursor, mood         |
|GABA                             |250–750     |mg         |Before bed              |Relaxation, sleep                 |

-----

### SAMPLE STACKS (Pre-built configurations)

**Stack 1: Morning Stack (All goals)**

- Vitamin D3 (2000 IU) + K2 (100mcg)
- Omega-3 (2000mg EPA+DHA)
- Magnesium Glycinate (200mg — split dose, other half evening)
- Vitamin C (500mg)
- Probiotic (10B CFU)

**Stack 2: Pre-Workout Performance**

- Creatine (5g)
- Caffeine (200mg)
- L-Citrulline (6g)
- Beta-Alanine (3.2g)
- L-Theanine (100mg) — with caffeine

**Stack 3: Night Recovery**

- Magnesium Glycinate (200mg)
- Zinc (15–20mg)
- Ashwagandha (300mg)
- L-Theanine (200mg)
- Melatonin (1mg) — if needed

**Stack 4: Cognitive/Focus**

- Lion’s Mane (1000mg, morning)
- Rhodiola (300mg, morning)
- Bacopa Monnieri (300mg, with meal)
- Caffeine + L-Theanine

-----

## 11. COMPLETE GROCERY LIST SYSTEM

### 11.1 Smart Grocery Generation

When user taps “Generate from Meal Plan”, the app:

1. Reads the active meal plan for the selected number of days
1. Extracts all ingredients across all meals
1. Aggregates duplicate items (e.g., “chicken breast” across 3 meals → combined kg total)
1. Auto-categorizes into grocery sections
1. Creates a new grocery list with all items pre-populated

### 11.2 Grocery Categories & Items Database

```
PRODUCE
├── Leafy Greens: spinach, kale, romaine, arugula, mixed greens, collard greens
├── Cruciferous: broccoli, cauliflower, Brussels sprouts, cabbage, bok choy
├── Colorful Veg: bell peppers (red/yellow/green), carrots, beets, red onion
├── Starchy Veg: sweet potato, white potato, butternut squash
├── Fruits (Fresh): banana, apple, blueberries, strawberries, mango, avocado
├── Citrus: lemon, lime, orange, grapefruit
├── Aromatics: garlic (bulbs), yellow onion, ginger root, shallots, jalapeño
└── Herbs (Fresh): cilantro, parsley, basil, mint, rosemary, thyme

PROTEIN — MEAT & FISH
├── Poultry: chicken breast, chicken thigh, turkey breast, ground turkey
├── Red Meat: lean ground beef (90%+), flank steak, sirloin, beef liver
├── Fish: salmon fillet, tilapia, tuna (fresh/canned), sardines, shrimp, cod
└── Deli: turkey deli meat (no nitrates)

PROTEIN — PLANT & DAIRY
├── Eggs: large eggs, egg whites (carton)
├── Dairy Protein: Greek yogurt (0% or 2%), cottage cheese, ricotta
├── Cheese: feta, parmesan, cheddar, mozzarella (fresh)
├── Plant Protein: firm tofu, tempeh, edamame (frozen), chickpeas, black beans
└── Milk: whole milk, skim milk, almond milk (unsweetened), oat milk

GRAINS & STARCHES
├── Dry Grains: rolled oats, brown rice, white rice, quinoa, farro, bulgur
├── Pasta: whole wheat pasta, lentil pasta, chickpea pasta, rice noodles
├── Bread: whole wheat bread, sourdough, whole grain tortillas (10")
├── Cereal: steel-cut oats, muesli
└── Other: rice cakes, corn tortillas

NUTS, SEEDS & HEALTHY FATS
├── Nuts: almonds, walnuts, cashews, macadamia, Brazil nuts, mixed nuts
├── Nut Butters: natural peanut butter, almond butter, sunflower seed butter
├── Seeds: chia seeds, flax seeds (ground), hemp seeds, pumpkin seeds, sunflower seeds
└── Oils & Fats: extra virgin olive oil (EVOO), coconut oil, avocado oil, ghee

LEGUMES & CANNED
├── Canned Protein: tuna (in water), salmon, sardines, chicken breast
├── Canned Legumes: chickpeas, black beans, lentils, kidney beans, cannellini
├── Tomato Products: crushed tomatoes, diced tomatoes, tomato paste, pasta sauce
└── Other Canned: coconut milk, artichoke hearts, olives

DAIRY & EGGS (if not above)
├── Yogurt: Greek yogurt (plain, 0% fat), kefir
├── Butter: unsalted butter, ghee
└── Heavy Cream / Sour Cream

CONDIMENTS & SEASONINGS
├── Sauces: soy sauce / tamari, hot sauce, salsa, marinara, pesto
├── Vinegars: apple cider vinegar, balsamic, red wine vinegar
├── Mustard: Dijon, yellow, whole grain
├── Dry Spices: cumin, paprika (smoked), turmeric, cinnamon, cayenne, garlic powder, onion powder, oregano, black pepper, sea salt, chili flakes
└── Sweeteners: raw honey, maple syrup, stevia, monk fruit sweetener

SUPPLEMENTS (pantry items)
├── Protein Powder: whey isolate, plant protein, casein
├── Powders: creatine monohydrate, collagen peptides, greens powder
└── Bars: protein bars (low sugar), energy bars

BEVERAGES
├── Coffee: whole bean or ground, espresso pods
├── Tea: green tea, matcha, herbal tea
├── Other: sparkling water, electrolyte packets
└── Kombucha

FROZEN
├── Protein: frozen shrimp, edamame, fish fillets
├── Vegetables: frozen broccoli, spinach, mixed vegetables, peas, corn
└── Fruit: frozen berries (blueberry, mixed berry), frozen mango

SNACKS
├── Healthy: roasted chickpeas, seaweed snacks, dark chocolate (70%+)
├── Rice cakes, plain popcorn, trail mix (unsweetened)
└── Nuts already listed above
```

### 11.3 Pre-Built Grocery Templates

**Template 1: High-Protein Basics (Weekly shop for 1 person)**

- 1.5 kg chicken breast
- 500g ground turkey
- 6 salmon fillets (150g each)
- 2 cans tuna (in water)
- 18 large eggs
- 2 cups egg whites (carton)
- 500g Greek yogurt (2%)
- 500g cottage cheese
- 500g oats
- 1 kg brown rice
- 500g sweet potato
- 1 bunch broccoli
- 2 bags spinach (200g)
- 3 bell peppers
- 2 avocados
- 1 bag almonds (100g)
- EVOO (1L)
- 1 scoop creatine (if not stocked)
- Whey protein powder

**Template 2: Keto Grocery Run**

- 500g bacon
- 1 dozen eggs
- 500g ground beef (80%)
- 4 ribeye steaks
- 200g cheddar
- 200g cream cheese
- Heavy cream (500ml)
- Butter (250g)
- 3 avocados
- 2 bags mixed greens
- Broccoli × 2
- Zucchini × 3
- Cauliflower × 1
- Macadamia nuts (100g)
- Olive oil
- Sour cream

**Template 3: Meal Prep Sunday (5-day prep)**

- 1.5 kg chicken breast
- 500g ground turkey (taco-seasoned)
- 500g brown rice (dry)
- 2 heads broccoli
- 4 bell peppers
- 3 sweet potatoes (medium)
- 1 dozen eggs
- 500g Greek yogurt
- 1 bunch spinach
- 2 avocados
- Salsa jar
- Lime × 2
- Taco seasoning
- Teriyaki sauce

**Template 4: Vegetarian Weekly**

- 400g firm tofu
- 400g paneer
- 4 cans chickpeas
- 3 cans lentils
- 2 cans black beans
- 500g quinoa
- 500g Greek yogurt
- 1 dozen eggs
- 250g feta
- 100g walnuts
- 1 bag spinach
- Broccoli × 2
- 4 bell peppers
- 3 sweet potatoes
- 2 cans crushed tomatoes
- Ginger root
- Garlic bulbs × 2
- Turmeric powder

-----

## 12. PIXEL-PERFECT UI SPECS

### 12.1 Card Component

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);        /* 16px */
  padding: var(--card-padding-mobile);    /* 16px mobile */
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

/* Green left accent on active/featured cards */
.card--featured::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--accent-primary);
  border-radius: 0 2px 2px 0;
}

/* Hover state (desktop) */
@media (hover: hover) {
  .card:hover {
    border-color: var(--border-default);
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }
}
```

### 12.2 Button System

```css
/* Primary */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: 0.02em;
  padding: 14px 24px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.btn-primary:active { transform: scale(0.97); filter: brightness(0.9); }

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
  /* same padding/font as primary */
}

/* Ghost */
.btn-ghost {
  background: var(--bg-overlay);
  color: var(--text-secondary);
  border: none;
}

/* Icon Button */
.btn-icon {
  width: 44px; height: 44px;        /* 44×44 minimum tap target */
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
}
```

### 12.3 Input Fields

```css
.input {
  background: var(--bg-overlay);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);    /* 15px — prevents iOS zoom */
  padding: 13px 16px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.input::placeholder { color: var(--text-muted); }

/* CRITICAL: font-size must be >= 16px on iOS or it will auto-zoom.
   Use 15px in design but set font-size: 16px on all inputs. */
input, textarea, select { font-size: 16px !important; }
```

### 12.4 Bottom Navigation Bar

```css
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(var(--nav-height-mobile) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.nav-tab {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  padding: 8px 12px;
  color: var(--text-muted);
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px; min-height: 44px;
  position: relative;
}

.nav-tab.active {
  color: var(--accent-primary);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  width: 24px; height: 3px;
  background: var(--accent-primary);
  border-radius: 2px 2px 0 0;
}

.nav-tab__label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
}
```

### 12.5 Modal / Bottom Sheet

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex; align-items: flex-end;  /* mobile: sheet from bottom */
}

/* Desktop: center the modal */
@media (min-width: 768px) {
  .modal-overlay { align-items: center; justify-content: center; }
  .modal-sheet { max-width: 540px; width: 100%; border-radius: var(--radius-xl); }
}

.modal-sheet {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 24px 20px;
  padding-bottom: calc(24px + var(--safe-bottom));
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Drag handle */
.modal-sheet::before {
  content: '';
  display: block;
  width: 40px; height: 4px;
  background: var(--border-default);
  border-radius: var(--radius-full);
  margin: 0 auto 20px;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
```

### 12.6 Progress Rings (SVG)

```javascript
// Donut ring SVG generator
function createProgressRing(size, strokeWidth, progress, color) {
  const r = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(progress, 1));
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Track -->
      <circle cx="${size/2}" cy="${size/2}" r="${r}"
        fill="none" stroke="rgba(255,255,255,0.06)"
        stroke-width="${strokeWidth}" />
      <!-- Progress -->
      <circle cx="${size/2}" cy="${size/2}" r="${r}"
        fill="none" stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        transform="rotate(-90 ${size/2} ${size/2})"
        style="transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" />
    </svg>
  `;
}
```

### 12.7 Toast Notifications

```javascript
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

```css
.toast {
  position: fixed;
  bottom: calc(var(--nav-height-mobile) + var(--safe-bottom) + 16px);
  left: 50%; transform: translateX(-50%) translateY(20px);
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-modal);
  opacity: 0; transition: all 0.25s ease;
  z-index: 300; white-space: nowrap;
}
.toast--visible { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast--success { border-color: var(--color-success); }
.toast--error   { border-color: var(--color-danger); }
```

-----

## 13. MOBILE PWA CHECKLIST

### Required for iOS Add to Home Screen

- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">`
- [ ] `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- [ ] `<link rel="apple-touch-icon" href="icons/icon-152.png">`
- [ ] `<meta name="apple-mobile-web-app-title" content="Health">`
- [ ] Status bar area accounted for: use `padding-top: var(--safe-top)` on app header
- [ ] No horizontal scroll anywhere
- [ ] All input font-size >= 16px (prevents auto-zoom)
- [ ] `touch-action: manipulation` on buttons (removes 300ms delay)
- [ ] `-webkit-tap-highlight-color: transparent` on interactive elements
- [ ] `overscroll-behavior: none` on body (prevents scroll bounce on app root)

### Required for Android Chrome Install

- [ ] `manifest.json` linked in `<head>`: `<link rel="manifest" href="manifest.json">`
- [ ] `theme_color` matches meta theme-color
- [ ] Service Worker registered and active
- [ ] Served over HTTPS (or localhost for development)
- [ ] Icon 192×192 and 512×512 present in manifest
- [ ] `start_url` accessible when offline

### UX on Mobile

- [ ] Bottom nav stays above keyboard when keyboard opens (test on iOS and Android)
- [ ] Long lists use virtual scrolling or pagination if > 100 items
- [ ] All modals dismiss on backdrop tap AND have explicit close button
- [ ] Swipe gestures use passive event listeners
- [ ] No `hover` states that require hover — use `:active` for touch feedback
- [ ] Screen reader labels on all icon-only buttons (`aria-label`)
- [ ] Minimum 44×44px tap targets on all interactive elements

-----

## 14. DESKTOP PWA CHECKLIST

### Window Controls Overlay (title bar customization)

```javascript
// Check if running in PWA mode
const isPWA = window.matchMedia('(display-mode: standalone)').matches
           || window.navigator.standalone === true;

// Adjust layout for title bar
if (isPWA) {
  document.documentElement.style.setProperty(
    '--title-bar-area-x',
    `env(titlebar-area-x, 0)`
  );
}
```

### Desktop Layout Requirements

- [ ] At 1024px+: sidebar navigation visible (not bottom nav)
- [ ] Content area max-width: 1200px, centered with margin: auto
- [ ] Cards in grid layout at desktop (2 or 3 columns where appropriate)
- [ ] No mobile-only animations that feel wrong on desktop
- [ ] Keyboard navigation fully functional (Tab, Enter, Escape)
- [ ] Hover states enabled (use `@media (hover: hover)`)
- [ ] Desktop: modals centered and sized (max-width: 560px)
- [ ] Scrollbar styled to match theme

```css
/* Custom scrollbar (desktop) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-dim); }
```

### Responsive Breakpoints

```css
/* Mobile first */
/* Base: 0–767px = mobile */
@media (min-width: 768px)  { /* Tablet: adjust grid, larger cards */ }
@media (min-width: 1024px) { /* Desktop: sidebar shows, nav hides */ }
@media (min-width: 1280px) { /* Wide: 3-column grids where appropriate */ }
```

-----

## 15. ACCESSIBILITY & PERFORMANCE

### Accessibility

- All images have `alt` text
- Color is not the only differentiator (use icons + text alongside color)
- Contrast ratios: text on –bg-surface must be ≥ 4.5:1
- Focus rings visible: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`
- Form labels always visible (not just placeholder text)
- Error states announced to screen readers: `role="alert"` on error messages
- Modal traps focus while open
- `prefers-reduced-motion` respected:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance

- First Contentful Paint target: < 1.5s on 4G
- No external runtime dependencies (no CDN JavaScript libraries)
- Google Fonts loaded with `display=swap`
- Images: SVG icons inline or as data URIs where small
- localStorage reads debounced when writing frequently (e.g., water log)
- Lazy-render screens not currently visible (don’t build DOM until navigated to)
- `requestAnimationFrame` for all animations

### Storage Management

- Warn user when localStorage approaches 4MB (check with `navigator.storage.estimate()`)
- Progress photos stored with quality reduction: `canvas.toDataURL('image/jpeg', 0.7)`
- Provide export + clear data option prominently in settings

-----

## 16. BUILD ORDER — STEP BY STEP

**Do these in order. Each step is independently testable.**

### Phase 1: Foundation (Days 1–2)

1. Set up `index.html` with all `<head>` meta tags (PWA, viewport, icons)
1. Create `manifest.json` with full icon set
1. Create `sw.js` — install, activate, fetch handlers
1. Create CSS: tokens.css, base reset, body layout
1. Create bottom nav bar (HTML + CSS only, no JS yet)
1. Verify: PWA installable on Android Chrome (Lighthouse audit)

### Phase 2: Navigation & Routing (Day 3)

1. Build JS screen router (hash-based: `#dashboard`, `#meals`, etc.)
1. Create empty screen containers for all 8 screens
1. Wire up bottom nav tabs to router
1. Add screen transition animations (slide left/right)
1. Handle URL params: `?screen=meals` on launch
1. Test: back button works, browser history works

### Phase 3: Data Layer (Day 4)

1. Build `store.js` with get/set/update/export/import
1. Initialize app with defaultState on first load
1. Profile setup flow (onboarding: appears only if `profile.name` is empty)
1. Wire Settings screen to store
1. Test: data persists across refresh, clear + reset works

### Phase 4: Dashboard (Day 5)

1. Build calorie ring (SVG donut, animated)
1. Build quick-log buttons (bottom sheet modals — empty for now)
1. Build today’s meal plan card
1. Build supplement check-in row
1. Build habit rings row
1. Build water progress bar
1. Connect all dashboard widgets to store data (mostly empty at this stage — test with mock data)

### Phase 5: Meal Planner (Days 6–7)

1. Build meal plan library data file (`meals.js`) — include all plans from Section 9
1. Build Meals screen: Today tab
1. Build Meals screen: Plans tab + add/edit plan modal
1. Build Meals screen: Log tab with history
1. Build “Generate Grocery List” integration
1. Connect dashboard calorie ring to real meal log data

### Phase 6: Supplements (Day 8)

1. Build supplement library data file (`supplements.js`) — 80+ items from Section 10
1. Build Supplements screen: Today tab with check-in
1. Build My Stack tab
1. Build Log tab (calendar view)
1. Connect dashboard supplement check-in to real stack

### Phase 7: Grocery (Day 9)

1. Build grocery database (`groceries.js`) — all categories from Section 11
1. Build Grocery screen: Current List tab
1. Add item autocomplete from grocery database
1. Build checked-off animation + “clear checked” action
1. Build template import functionality
1. Build meal-plan-to-grocery-list generator

### Phase 8: Workout (Day 10)

1. Build exercise library (100+ exercises with muscle group tags)
1. Build Workout screen: Today tab
1. Build workout timer mode
1. Build Programs tab
1. Build History tab + charts

### Phase 9: Habits + Water (Day 11)

1. Build water tracker with glass animation
1. Build habit grid with streak tracking
1. Build habit completion calendar
1. Connect to dashboard habit rings

### Phase 10: Body Stats (Day 12)

1. Build weight log with line chart (use SVG/Canvas — no chart library)
1. Build measurements log
1. Build progress photos (camera input + base64 storage)
1. Calculate and display BMI, TDEE, macro targets from profile

### Phase 11: Polish & PWA (Days 13–14)

1. Full responsive pass: test every screen at 375, 390, 428, 768, 1024, 1440px
1. Add all toast notifications
1. Add loading skeletons for any async operations
1. Add empty states (first-run experience) for all empty lists
1. Add onboarding flow for new users
1. Add data export/import in Settings
1. Add PWA install prompt (custom, not browser default)
1. Run Lighthouse audit — target all scores > 90
1. Test on actual iOS device (Safari) and Android (Chrome)
1. Fix iOS-specific bugs (safe area, input zoom, 300ms delay)

### Phase 12: Final QA (Day 15)

1. All CRUD operations verified (create, read, update, delete in every module)
1. All navigation paths tested
1. App works fully offline (airplane mode test)
1. Data survives browser close + reopen
1. No console errors in production mode
1. Accessibility audit (axe DevTools)

-----

## 17. TESTING CHECKLIST

### Functional Tests

**Dashboard**

- [ ] Calorie ring updates when meals are logged
- [ ] Supplement check-in updates and persists
- [ ] Habit rings update and update streak count
- [ ] Water glasses increment and persist
- [ ] Date shown is correct (changes at midnight)

**Meals**

- [ ] Can create a new meal plan
- [ ] Can add meals to plan days
- [ ] Can set a plan as active
- [ ] Active plan appears on dashboard
- [ ] Logging a meal adds to calorie total
- [ ] Meal history shows correct entries
- [ ] Can delete logged meal (with undo)

**Supplements**

- [ ] Can add supplement to stack from library
- [ ] Can add custom supplement
- [ ] Checking supplement logs timestamp
- [ ] Adherence calendar updates
- [ ] Active toggle removes from today’s list

**Grocery**

- [ ] Can add item manually
- [ ] Autocomplete suggests from database
- [ ] Check off marks item with strikethrough
- [ ] “Clear checked” removes completed items
- [ ] “Generate from plan” creates accurate list
- [ ] Template import works

**Workout**

- [ ] Can create workout program
- [ ] Can log a completed workout
- [ ] Timer runs accurately
- [ ] Workout history appears in log

**Habits**

- [ ] Habit completes and marks today
- [ ] Streak increments on consecutive days
- [ ] Streak resets correctly if day missed
- [ ] Custom habit creation works

**Stats**

- [ ] Weight log saves and chart updates
- [ ] BMI calculates correctly from profile
- [ ] TDEE updates when profile changes

**Settings**

- [ ] Export creates valid JSON
- [ ] Import restores data
- [ ] Clear data requires confirmation and resets everything
- [ ] Theme toggle works (if implemented)

### Device Tests

|Device           |OS        |Browser        |Test          |
|-----------------|----------|---------------|--------------|
|iPhone 14        |iOS 17    |Safari         |Full flow     |
|iPhone SE (375px)|iOS 16    |Safari         |Layout        |
|Pixel 7          |Android 14|Chrome         |Full flow     |
|Samsung Galaxy   |Android 13|Samsung Browser|Layout        |
|iPad             |iPadOS    |Safari         |Desktop layout|
|MacBook          |macOS     |Chrome         |PWA install   |
|Windows laptop   |Win 11    |Edge           |PWA install   |

### PWA Tests

- [ ] Chrome DevTools → Manifest: all fields valid
- [ ] Chrome DevTools → Service Workers: active, no errors
- [ ] Chrome DevTools → Cache Storage: all assets cached
- [ ] Lighthouse PWA score > 90
- [ ] Offline: reload in airplane mode — app loads and all data accessible
- [ ] Install prompt appears on mobile Chrome
- [ ] “Add to Home Screen” on iOS Safari works
- [ ] Installed app on Android: behaves like native (no address bar)
- [ ] Installed app on desktop: opens in own window

-----

## APPENDIX A: MOTIVATION QUOTES (20 — used for daily rotation)

```javascript
const quotes = [
  "The body achieves what the mind believes.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "Take care of your body. It's the only place you have to live.",
  "The groundwork for all happiness is good health.",
  "Consistency is more important than intensity.",
  "Your health is an investment, not an expense.",
  "Small daily improvements are the key to staggering long-term results.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't wish for a good body. Work for it.",
  "Health is not about the weight you lose, but the life you gain.",
  "Your body hears everything your mind says.",
  "It's not about being perfect. It's about effort.",
  "Movement is medicine.",
  "Progress, not perfection.",
  "A year from now you'll wish you started today.",
  "One rep closer. One meal better. One habit built.",
  "Rest when you must. But never quit.",
  "Be the version of yourself you're trying to become.",
  "Every day is a chance to get better."
];
// Daily quote: quotes[dayOfYear % 20]
```

-----

## APPENDIX B: ICON REFERENCE (SVG inline icons)

Use inline SVG icons from the Lucide icon set (copy SVGs directly — no CDN dependency).

Key icons needed:

- `home` / `grid-2x2` — Dashboard
- `utensils` — Meals
- `pill` — Supplements
- `shopping-cart` — Grocery
- `dumbbell` — Workout
- `check-circle-2` — Habits
- `trending-up` — Stats
- `settings-2` — Settings
- `plus`, `minus`, `x`, `check` — Actions
- `chevron-right`, `chevron-left` — Navigation
- `trash-2` — Delete
- `pencil` — Edit
- `star`, `star-fill` — Favorites
- `download`, `upload` — Export/Import
- `droplets` — Water
- `flame` — Calories/Streak
- `target` — Goal
- `calendar` — Date
- `clock` — Time

-----

*End of Blueprint — Health PWA v1.0*
*Build it offline. Keep it private. Keep it simple. Keep it polished.*
