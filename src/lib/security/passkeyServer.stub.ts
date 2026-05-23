/**
 * Future server-verified passkeys (SimpleWebAuthn-style API).
 * GitHub Pages static deploy cannot verify assertions — enable when you add a backend.
 *
 * Expected routes (reference):
 * - POST /api/webauthn/register/options
 * - POST /api/webauthn/register/verify
 * - POST /api/webauthn/authenticate/options
 * - POST /api/webauthn/authenticate/verify
 *
 * DB tables (reference): webauthn_users, webauthn_credentials, webauthn_challenges
 */

export interface PasskeyServerCapability {
	available: false;
	reason: string;
}

export function getPasskeyServerCapability(): PasskeyServerCapability {
	return {
		available: false,
		reason: 'This build is a static PWA. Use local Face ID / Touch ID lock, or add a backend for synced passkeys.'
	};
}
