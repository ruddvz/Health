import { browser } from '$app/environment';
import {
	cloudApiBaseUrl,
	configuredOrigin,
	configuredRpId,
	deploymentMode,
	isCloudApiConfigured
} from '$lib/security/domainConfig';

export interface RelyingPartyInfo {
	origin: string;
	rpId: string;
	displayName: string;
	isGitHubPages: boolean;
	isCustomDomain: boolean;
	cloudApiConfigured: boolean;
	warning?: string;
}

/** Effective RP ID for WebAuthn (must be registrable domain suffix of origin). */
export function getRpId(
	hostname: string = browser ? window.location.hostname : 'localhost'
): string {
	const configured = configuredRpId();
	if (configured) return configured;
	if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
	if (hostname.endsWith('.github.io')) return hostname;
	const parts = hostname.split('.');
	if (parts.length >= 2) return parts.slice(-2).join('.');
	return hostname;
}

export function getRelyingPartyInfo(): RelyingPartyInfo {
	if (!browser) {
		return {
			origin: configuredOrigin() ?? '',
			rpId: configuredRpId() ?? 'localhost',
			displayName: 'Health',
			isGitHubPages: false,
			isCustomDomain: !!configuredRpId(),
			cloudApiConfigured: isCloudApiConfigured()
		};
	}
	const origin = configuredOrigin() ?? window.location.origin;
	const hostname = window.location.hostname;
	const rpId = getRpId(hostname);
	const mode = deploymentMode();
	const isGitHubPages = mode === 'github-pages';
	const isCustomDomain = mode === 'custom-domain';

	let warning: string | undefined;
	if (isGitHubPages) {
		warning =
			'Local passkeys bind to this GitHub Pages host. For production, set PUBLIC_HEALTH_RP_ID to your custom domain (Phase 2) and deploy the API — see docs/CUSTOM_DOMAIN.md.';
	} else if (mode === 'localhost') {
		warning =
			'Development mode: passkeys here only work on localhost. Match HEALTH_ORIGIN / PUBLIC_HEALTH_RP_ID with your production domain before launch.';
	} else if (isCustomDomain) {
		warning = cloudApiBaseUrl()
			? 'Custom domain + cloud API configured. Server passkeys and encrypted sync are available.'
			: 'Custom domain detected. Add PUBLIC_HEALTH_API_URL (Vercel) for cloud passkeys and sync.';
	}

	return {
		origin,
		rpId,
		displayName: 'Health',
		isGitHubPages,
		isCustomDomain,
		cloudApiConfigured: isCloudApiConfigured(),
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
