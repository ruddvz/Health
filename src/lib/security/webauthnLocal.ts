import { getRelyingPartyInfo, isWebAuthnAvailable } from '$lib/security/rpOrigin';
import type { PasskeyTier, WebAuthnCredentialMeta } from '$lib/security/types';

function b64urlToBuffer(b64url: string): ArrayBuffer {
	const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
	const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

function bufferToB64url(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomChallenge(): ArrayBuffer {
	const buf = new Uint8Array(32);
	crypto.getRandomValues(buf);
	return buf.buffer;
}

const LOCAL_USER_ID = new TextEncoder().encode('health-local-lock-v1');

export type WebAuthnRegisterResult =
	| { ok: true; meta: WebAuthnCredentialMeta }
	| { ok: false; error: string };

export type WebAuthnAuthResult = { ok: true } | { ok: false; error: string };

/**
 * Register a platform authenticator for local app lock.
 * This is NOT server-verified passkey sync — suitable for device privacy screen only.
 */
export async function registerPlatformLock(tier: PasskeyTier = 'local'): Promise<WebAuthnRegisterResult> {
	if (!isWebAuthnAvailable()) {
		return { ok: false, error: 'WebAuthn is not available in this browser.' };
	}
	const rp = getRelyingPartyInfo();
	try {
		const cred = (await navigator.credentials.create({
			publicKey: {
				challenge: randomChallenge(),
				rp: { name: rp.displayName, id: rp.rpId },
				user: {
					id: LOCAL_USER_ID,
					name: 'health@local',
					displayName: 'Health Lock'
				},
				pubKeyCredParams: [
					{ alg: -7, type: 'public-key' },
					{ alg: -257, type: 'public-key' }
				],
				authenticatorSelection: {
					authenticatorAttachment: 'platform',
					userVerification: 'required',
					residentKey: 'discouraged',
					requireResidentKey: false
				},
				timeout: 60_000,
				attestation: 'none'
			}
		})) as PublicKeyCredential | null;

		if (!cred || !(cred.rawId instanceof ArrayBuffer)) {
			return { ok: false, error: 'No credential was created.' };
		}

		return {
			ok: true,
			meta: {
				credentialIdB64: bufferToB64url(cred.rawId),
				createdAt: new Date().toISOString(),
				tier
			}
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Registration was cancelled or failed.';
		return { ok: false, error: msg };
	}
}

/** Unlock via platform authenticator (Face ID / Touch ID / Windows Hello). */
export async function authenticatePlatformLock(
	meta: WebAuthnCredentialMeta
): Promise<WebAuthnAuthResult> {
	if (!isWebAuthnAvailable()) {
		return { ok: false, error: 'WebAuthn is not available in this browser.' };
	}
	try {
		const assertion = (await navigator.credentials.get({
			publicKey: {
				challenge: randomChallenge(),
				rpId: getRelyingPartyInfo().rpId,
				allowCredentials: [
					{
						id: b64urlToBuffer(meta.credentialIdB64),
						type: 'public-key'
					}
				],
				userVerification: 'required',
				timeout: 60_000
			}
		})) as PublicKeyCredential | null;

		if (!assertion) return { ok: false, error: 'Authentication was cancelled.' };
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Authentication failed.';
		return { ok: false, error: msg };
	}
}
