# iOS PWA QA checklist

Run on a real iPhone after each release candidate. Record date and iOS version in `docs/QA_CHECKLIST.md`.

## Install

- [ ] Open https://ruddvz.github.io/Health/ in Safari
- [ ] Share → Add to Home Screen
- [ ] Icon is not clipped; title reads **Health**
- [ ] Open from home screen → standalone (no Safari URL bar)

## Layout

- [ ] Safe area: content clears notch and home indicator
- [ ] Bottom nav does not cover primary CTAs (scroll padding on each tab)
- [ ] Viewports: 375 (SE), 393 (14/15), 430 (Pro Max)

## Routes (no plan)

- [ ] `/Health/` welcome with create / import / sample
- [ ] Today, Meals, Train show empty states with Import + sample CTAs
- [ ] Progress shows no-plan note + check-in still available
- [ ] System → Phases, Grocery, Prep, Supplements show no-plan states (no blank redirect)

## Routes (sample plan loaded)

- [ ] Import or load sample → Today shows timeline and macros
- [ ] Meals cook mode sheet opens; safe-area on sticky controls
- [ ] Train rest timer survives lock screen briefly
- [ ] Direct URL refresh works: `/Health/today`, `/meals`, `/train`, `/progress`, `/system`

## Offline

- [ ] Load app online once
- [ ] Airplane mode → shell and plan data still readable

## Health Lock

- [ ] Enable lock with PIN + recovery codes
- [ ] Background app → returns to unlock gate
- [ ] Cold start: passkey then PIN if vault encrypted

## Service worker

- [ ] After deploy, update snackbar or hard refresh picks up new build
