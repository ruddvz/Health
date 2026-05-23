const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400'
};

export function corsPreflight(): Response {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
	});
}

export function errorResponse(message: string, status = 400): Response {
	return jsonResponse({ ok: false, error: message }, status);
}

export async function readJson<T>(request: Request): Promise<T> {
	return (await request.json()) as T;
}

export function bearerToken(request: Request): string | null {
	const h = request.headers.get('Authorization');
	if (!h?.startsWith('Bearer ')) return null;
	return h.slice(7).trim() || null;
}
