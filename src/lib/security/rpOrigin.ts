import { browser } from '$app/environment';

export interface RelyingPartyInfo {
	origin: string;
	rpId: string;
	displayName: string;
	/** True when served from github.io with a repo path base — passkeys bind to this host. */
	isGitHubPages: boolean;
	warning?: string;
}

/** Effective RP ID for WebAuthn (must be registrable domain suffix of origin). */
export function getRpId(hostname: string = browser ? window.location.hostname : 'localhost'): string {
	if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
	// github.io pages: RP ID is the full pages host (e.g. ruddvz.github.io)
	if (hostname.endsWith('.github.io')) return hostname;
	const parts = hostname.split('.');
	if (parts.length >= 2) return parts.slice(-2).join('.');
	return hostname;
}

export function getRelyingPartyInfo(): RelyingPartyInfo {
	if (!browser) {
		return {
			origin: '',
			rpId: 'localhost',
			displayName: 'Health',
			isGitHubPages: false
		};
	}
	const origin = window.location.origin;
	const hostname = window.location.hostname;
	const rpId = getRpId(hostname);
	const isGitHubPages = hostname.endsWith('.github.io');

	let warning: string | undefined;
	if (isGitHubPages) {
		warning =
			'Passkeys and Face ID lock are tied to this GitHub Pages URL. If you move to a custom domain later, set up a new lock on the new site — existing passkeys will not transfer automatically.';
	} else if (hostname === 'localhost') {
		warning =
			'Development mode: locks created here only work on localhost. Use your production URL before relying on passkeys long term.';
	}

	return {
		origin,
		rpId,
		displayName: 'Health',
		isGitHubPages,
		warning
	};
}

export function isWebAuthnAvailable(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.PublicKeyCredential !== 'undefined' &&
		typeof navigator.credentials?.create === 'function'
	);
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
	if (!isWebAuthnAvailable()) return false;
	try {
		return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
	} catch {
		return false;
	}
}
