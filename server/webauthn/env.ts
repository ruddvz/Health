export function getWebAuthnEnv() {
	const rpID = process.env.HEALTH_RP_ID ?? process.env.PUBLIC_HEALTH_RP_ID ?? 'localhost';
	const origin = (
		process.env.HEALTH_ORIGIN ??
		process.env.PUBLIC_HEALTH_ORIGIN ??
		'http://localhost:5173'
	).replace(/\/$/, '');
	const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	return {
		rpID,
		origin,
		rpName: process.env.HEALTH_RP_NAME ?? 'Health',
		supabaseUrl,
		supabaseServiceKey,
		useMemoryStore: !supabaseUrl || !supabaseServiceKey
	};
}
