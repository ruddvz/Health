import { corsPreflight, methodNotAllowed, serverError } from '../../../server/webauthn/http.js';
import { handleRegisterVerify } from '../../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight(request);
	if (request.method !== 'POST') return methodNotAllowed(request);
	try {
		return await handleRegisterVerify(request);
	} catch (e) {
		return serverError(request, e);
	}
}
