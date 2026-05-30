import {
	isCloudApiConfigured,
	cloudApiBaseUrl,
	configuredRpId,
	configuredOrigin
} from '$lib/security/domainConfig';

export interface PasskeyServerCapability {
	available: boolean;
	reason?: string;
	apiUrl?: string;
	rpId?: string;
	origin?: string;
}

export function getPasskeyServerCapability(): PasskeyServerCapability {
	if (isCloudApiConfigured()) {
		return {
			available: true,
			apiUrl: cloudApiBaseUrl(),
			rpId: configuredRpId(),
			origin: configuredOrigin()
		};
	}
	return {
		available: false,
		reason:
			'Cloud passkeys need PUBLIC_HEALTH_API_URL (Vercel API) + Supabase. Local Face ID lock still works offline.'
	};
}
