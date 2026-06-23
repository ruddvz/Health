import { corsPreflight, methodNotAllowed } from '../../server/webauthn/http.js';
import { handleHealth } from '../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight(request);
	if (request.method !== 'GET') return methodNotAllowed(request);
	return handleHealth(request);
}
