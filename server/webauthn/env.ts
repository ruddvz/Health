export function getWebAuthnEnv() {
	const rpID = process.env.HEALTH_RP_ID ?? process.env.PUBLIC_HEALTH_RP_ID ?? 'localhost';
	const origin = (
		process.env.HEALTH_ORIGIN ??
		process.env.PUBLIC_HEALTH_ORIGIN ??
		'http://localhost:5173'
	).replace(/\/$/, '');
	const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
	const allowMemoryStore = process.env.HEALTH_ALLOW_MEMORY_STORE === 'true';
	const hasSupabase = Boolean(supabaseUrl && supabaseServiceKey);
	const useMemoryStore = allowMemoryStore && !hasSupabase;
	const productionMisconfigured = isProd && !hasSupabase && !allowMemoryStore;

	return {
		rpID,
		origin,
		rpName: process.env.HEALTH_RP_NAME ?? 'Health',
		supabaseUrl,
		supabaseServiceKey,
		useMemoryStore,
		hasSupabase,
		isProd,
		productionMisconfigured
	};
}

export function assertCloudBackendReady(): void {
	const env = getWebAuthnEnv();
	if (env.productionMisconfigured) {
		throw new Error(
			'Cloud passkey backend is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or HEALTH_ALLOW_MEMORY_STORE=true for explicit dev-only mode.'
		);
	}
}
