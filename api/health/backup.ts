import { corsPreflight, methodNotAllowed, serverError } from '../../server/webauthn/http.js';
import {
	handleBackupDelete,
	handleBackupGet,
	handleBackupPut
} from '../../server/webauthn/handlers.js';

export const config = { runtime: 'nodejs' };

export default async function handler(request: Request): Promise<Response> {
	if (request.method === 'OPTIONS') return corsPreflight(request);
	try {
		if (request.method === 'PUT' || request.method === 'POST')
			return await handleBackupPut(request);
		if (request.method === 'GET') return await handleBackupGet(request);
		if (request.method === 'DELETE') return await handleBackupDelete(request);
		return methodNotAllowed(request);
	} catch (e) {
		return serverError(request, e);
	}
}
