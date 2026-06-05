# Privacy model

## Default: local-first

- Plan, progress, onboarding, and settings are stored in **browser localStorage** under keys prefixed `health.v2.*`.
- No analytics SDK is bundled in the SvelteKit app.
- No account is required to use the app on GitHub Pages.

## Health Lock (optional)

When enabled:

- Data is encrypted with **AES-GCM** in **IndexedDB** (`health-security` database).
- A **recovery PIN** (salted hash on device) wraps the data encryption key.
- **WebAuthn** platform passkey unlocks the app UI; after cold start you may still need the PIN to decrypt the vault.
- Recovery codes are one-time hashes stored locally.

Migration to the vault creates a temporary backup; failed encryption restores plaintext storage.

## Cloud backup (optional, Phase 3)

Only when `PUBLIC_HEALTH_API_URL` points to a deployed API:

- Passkeys are verified server-side (Vercel + Supabase).
- Backups are **encrypted client-side** with a user-chosen password before upload.
- The server stores ciphertext only; losing the backup password means the backup cannot be decrypted.

## Deletion

**System → Settings → Delete all local data** clears:

- localStorage health keys
- IndexedDB vault and security store
- Health Lock config
- In-memory app state (returns to welcome / no-plan flows)

## Threat model (proportionate)

- Protects against casual device access and shoulder-surfing (Health Lock).
- Does **not** protect against malware on the device, forensic disk access, or a compromised browser.
- Not a HIPAA/medical-grade vault; users should export backups they control.

## Diagnostics export

Diagnostics JSON includes schema warnings and storage mode — **never** PINs, recovery codes, or vault keys.
