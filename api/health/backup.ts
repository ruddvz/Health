import { corsPreflight } from '../../server/webauthn/http.js';
import { handleBackupGet, handleBackupPut } from '../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight(request);
	try {
		if (request.method === 'PUT' || request.method === 'POST')
			return await handleBackupPut(request);
		if (request.method === 'GET') return await handleBackupGet(request);
		return new Response('Method not allowed', { status: 405 });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Server error';
		return new Response(JSON.stringify({ ok: false, error: msg }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
