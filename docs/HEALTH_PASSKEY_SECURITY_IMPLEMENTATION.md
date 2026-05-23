# Health Passkey Security — Implementation Guide

> Static GitHub Pages PWA · local-first · Phase 1 shipped in PR #49+

## Architecture overview

| Phase | Goal | Status |
|-------|------|--------|
| **1** | Local passkey app lock + encrypted vault | Implemented |
| **2** | Custom domain (`health.example.com`) | Before mass passkey rollout |
| **3** | Server passkeys + optional cloud sync | Future (Supabase / Workers + SimpleWebAuthn) |

## Phase 1 — What shipped

### User flows

1. User imports JSON plan → optional **Protect your health plan** sheet.
2. User sets **recovery PIN** (required) + **passkey** + **recovery codes** (required).
3. Plan/progress/onboarding/settings migrate to **AES-GCM encrypted IndexedDB** vault.
4. Protected routes show **Unlock Health** (passkey and/or PIN).
5. **System → Security** manages passkey, PIN, codes, auto-lock, remove passkey.

### Files

| Area | Path |
|------|------|
| Lock store | `src/lib/stores/healthLock.ts` |
| Vault bridge | `src/lib/stores/vaultBridge.ts` |
| Crypto / vault | `src/lib/security/crypto.ts`, `vault.ts` |
| WebAuthn (local) | `src/lib/security/webauthnLocal.ts` |
| RP / domain | `src/lib/security/rpOrigin.ts` |
| Route gate | `src/lib/security/routeLock.ts`, `src/routes/+layout.svelte` |
| UI | `UnlockGate.svelte`, `PasskeyOfferSheet.svelte`, `routes/system/security/` |
| Server stub | `src/lib/security/passkeyServer.stub.ts` |

### Security properties

- **Passkey private key** never touches the app (platform / password manager).
- App stores **credential id** + **PIN hash** + **recovery code hashes** + **encrypted blobs**.
- **Session unlock** is in-memory only; auto-lock clears DEK from memory.
- **PIN rate limit**: 5 failures → exponential backoff (30s base).

### Limitations (intentional)

- Passkey unlock opens the app; **encrypted data** still needs **recovery PIN** after cold start.
- No server challenge/verification (not full NutriCalc-style accounts).
- Passkeys tied to **origin** — document domain migration in Security UI.

## Phase 2 — Custom domain

Before asking users to register production passkeys:

1. Deploy PWA to `https://health.yourdomain.com` (or similar).
2. Users re-register passkeys on the new origin.
3. Update `vite.config.ts` / `svelte.config.js` `paths.base` if not using subdomain root.

## Phase 3 — Server passkeys (reference)

### API routes (SimpleWebAuthn style)

```
POST /api/webauthn/register/options
POST /api/webauthn/register/verify
POST /api/webauthn/authenticate/options
POST /api/webauthn/authenticate/verify
```

### Postgres (reference)

```sql
create table passkey_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_name text,
  transports text[],
  created_at timestamptz default now(),
  last_used_at timestamptz
);
```

Frontend remains on GitHub Pages; API on Supabase Edge, Cloudflare Workers, or Vercel Functions.

## Verification

```bash
npm run check
npm test
npm run build
```

Manual: `docs/QA_CHECKLIST.md` → **Health Lock** section.

## Agent prompt (maintenance)

When extending Health Lock:

1. Keep **local-first** default; server features behind explicit flags.
2. Never store passkey private keys; only public credential metadata.
3. Test on **HTTPS** production origin before release.
4. Update this doc + CHANGELOG + QA checklist for behavior changes.
