import { corsPreflight } from '../../../server/webauthn/http.js';
import { handleRegisterOptions } from '../../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight();
	if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
	try {
		return await handleRegisterOptions(request);
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Server error';
		return new Response(JSON.stringify({ ok: false, error: msg }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
