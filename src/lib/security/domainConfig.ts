import { browser } from '$app/environment';

/** Configured production RP ID (Phase 2). Example: `health.bookphysio.in` */
export function configuredRpId(): string | undefined {
	const v = import.meta.env.PUBLIC_HEALTH_RP_ID;
	return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Canonical app origin for passkeys when not inferred from window. */
export function configuredOrigin(): string | undefined {
	const v = import.meta.env.PUBLIC_HEALTH_ORIGIN;
	return typeof v === 'string' && v.trim() ? v.trim().replace(/\/$/, '') : undefined;
}

/** Base URL for Phase 3 WebAuthn + encrypted sync API (Vercel/Workers). */
export function cloudApiBaseUrl(): string | undefined {
	const v = import.meta.env.PUBLIC_HEALTH_API_URL;
	return typeof v === 'string' && v.trim() ? v.trim().replace(/\/$/, '') : undefined;
}

export function isCloudApiConfigured(): boolean {
	return !!cloudApiBaseUrl();
}

export function deploymentMode(): 'github-pages' | 'custom-domain' | 'localhost' | 'unknown' {
	if (!browser) return 'unknown';
	const host = window.location.hostname;
	if (host === 'localhost' || host === '127.0.0.1') return 'localhost';
	if (host.endsWith('.github.io')) return 'github-pages';
	const custom = configuredRpId();
	if (custom && (host === custom || host.endsWith(`.${custom}`))) return 'custom-domain';
	return 'unknown';
}
