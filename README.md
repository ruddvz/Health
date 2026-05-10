# Health — Personalised Plan

A mobile web app that turns a personalised Claude-generated health plan into a beautiful, interactive guide.

## How it works

1. Fill in your details in the intake form
2. The app generates a pre-built prompt tailored to you
3. Paste the prompt into Claude at [claude.ai](https://claude.ai)
4. Upload the JSON plan Claude gives you
5. Your personalised plan — meals, macros, phases, grocery list, supplements — renders as a native-feeling mobile app

## Features

- Six-section intake form covering nutrition, training, lifestyle, and supplements
- Pre-filled Claude prompt — zero editing required, just copy and paste
- JSON-driven rendering — every piece of content comes from Claude's analysis
- Grocery checklist with persistent check-off state
- Meal prep guide with checkable steps
- Supplement stack with timing schedule
- Budget versus premium options for protein powder and grocery items
- Works offline after first load (PWA)

## Tech

Single `index.html` file (full UI is being rebuilt). No framework. No build step. No backend. All data stays on your device — nothing is sent anywhere.

Hosted on GitHub Pages: [https://ruddvz.github.io/Health/](https://ruddvz.github.io/Health/)
