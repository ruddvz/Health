# Release QA — 2026-06-05

## Automated gate (CI / local)

```bash
npm ci
npm run quality:e2e
```

Last verified on branch `cursor/audit-complete-dod-7a3c` in the cloud agent environment:

- `npm run check` — pass
- `npm run lint` — pass
- `npm test` — pass (52 unit tests)
- `npm run build` + `verify:sw` — pass
- `npm run test:e2e` — pass (20 Playwright tests, Chromium)

## Manual iPhone QA

Manual standalone PWA checks are **required before calling a release “device verified.”** Use `docs/IOS_PWA_QA.md` on a physical iPhone after each GitHub Pages deploy.

| Check                             | Status         | Notes                                              |
| --------------------------------- | -------------- | -------------------------------------------------- |
| Add to Home Screen icon           | Pending device | `apple-touch-icon.png` shipped in static assets    |
| Standalone safe-area / bottom nav | Pending device | Shell uses `padding-bottom: calc(nav + safe-area)` |
| Offline after first load          | Pending device | Service worker precaches shell + key routes        |
| Passkey / Health Lock on HTTPS    | Pending device | Test on https://ruddvz.github.io/Health/           |

**Sign-off:** _Device QA pending — automated gates passed 2026-06-05._
