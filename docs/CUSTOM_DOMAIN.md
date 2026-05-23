# Custom domain setup (Phase 2)

Passkeys bind to a **relying party ID** (domain). Plan your permanent URL before users register production passkeys.

## Recommended flow

1. **Develop** on `localhost` (local app lock only).
2. **Staging** on `ruddvz.github.io/Health` (GitHub Pages — passkeys bind to `ruddvz.github.io`).
3. **Production** on `https://health.yourdomain.com` (custom domain + Vercel API).

## DNS

Point your domain to either:

- **GitHub Pages** — CNAME to `ruddvz.github.io` (static PWA only; no `/api` routes).
- **Vercel** (recommended for Phases 1–3) — A/CNAME per Vercel docs; serves `build/` + `/api/*` serverless functions.

## Environment variables

Set in Vercel (or `.env` for local API dev):

| Variable | Example | Purpose |
|----------|---------|---------|
| `PUBLIC_HEALTH_RP_ID` | `health.bookphysio.in` | WebAuthn RP ID |
| `PUBLIC_HEALTH_ORIGIN` | `https://health.bookphysio.in` | Expected origin |
| `PUBLIC_HEALTH_API_URL` | `https://health.bookphysio.in` | Client calls `/api/webauthn/*` |
| `HEALTH_RP_ID` | same as above | Server WebAuthn |
| `HEALTH_ORIGIN` | same as above | Server verification |

Rebuild the static app after changing `PUBLIC_*` vars so Vite inlines them.

## GitHub Pages + API split

If the PWA stays on GitHub Pages but the API is on Vercel:

```env
PUBLIC_HEALTH_API_URL=https://health-api.vercel.app
PUBLIC_HEALTH_RP_ID=ruddvz.github.io
```

Note: passkey RP ID must match the **origin where registration happened**. Prefer one canonical origin for both PWA and API when possible.

## Checklist

- [ ] DNS live and HTTPS working
- [ ] `PUBLIC_HEALTH_RP_ID` matches registrable domain
- [ ] Supabase migration applied (`supabase/migrations/20260523120000_health_passkey_cloud.sql`)
- [ ] Vercel env vars set; `GET /api/health/status` returns `{ ok: true }`
- [ ] Register test passkey on production origin
- [ ] Re-register local/github passkeys separately (they do not transfer)
