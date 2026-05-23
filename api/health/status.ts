import { corsPreflight } from '../../server/webauthn/http.js';
import { handleHealth } from '../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight();
	if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
	return handleHealth();
}
