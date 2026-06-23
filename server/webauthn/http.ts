import type { Request } from '@vercel/node';

const DEFAULT_ORIGINS = ['https://ruddvz.github.io'];

function originFromRequest(request: Request): string | null {
	const h = request.headers;
	if (typeof h.get === 'function') return h.get('Origin');
	const raw = h as Record<string, string | string[] | undefined>;
	const v = raw.origin ?? raw.Origin;
	return Array.isArray(v) ? v[0] : (v ?? null);
}

function allowedOrigins(): Set<string> {
	const fromEnv = (process.env.HEALTH_ALLOWED_ORIGINS ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const dev = process.env.NODE_ENV !== 'production';
	const list = fromEnv.length ? fromEnv : DEFAULT_ORIGINS;
	if (dev) {
		list.push('http://localhost:5173', 'http://127.0.0.1:5173');
	}
	return new Set(list);
}

export function resolveCorsOrigin(request: Request): string {
	const originHeader = originFromRequest(request);
	const allowed = allowedOrigins();
	if (originHeader && allowed.has(originHeader)) return originHeader;
	return DEFAULT_ORIGINS[0];
}

export function corsHeaders(request: Request): Record<string, string> {
	return {
		'Access-Control-Allow-Origin': resolveCorsOrigin(request),
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Max-Age': '86400',
		Vary: 'Origin'
	};
}

export function corsPreflight(request: Request): Response {
	return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** 405 with CORS headers so browsers can read the response cross-origin. */
export function methodNotAllowed(request: Request): Response {
	return errorResponse(request, 'Method not allowed', 405);
}

/** 500 with CORS headers; never leaks stack traces. */
export function serverError(request: Request, e: unknown): Response {
	const msg = e instanceof Error ? e.message : 'Server error';
	return errorResponse(request, msg, 500);
}

export function jsonResponse(request: Request, body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders(request) }
	});
}

export function errorResponse(request: Request, message: string, status = 400): Response {
	return jsonResponse(request, { ok: false, error: message }, status);
}

export const MAX_JSON_BODY_BYTES = 256 * 1024;

export async function readJson<T>(request: Request): Promise<T> {
	const len = request.headers.get('content-length');
	if (len) {
		const n = Number(len);
		if (Number.isFinite(n) && n > MAX_JSON_BODY_BYTES) {
			throw new Error('Request body too large');
		}
	}
	const text = await request.text();
	if (text.length > MAX_JSON_BODY_BYTES) {
		throw new Error('Request body too large');
	}
	if (!text.trim()) return {} as T;
	return JSON.parse(text) as T;
}

export function bearerToken(request: Request): string | null {
	const h = request.headers.get('Authorization');
	if (!h?.startsWith('Bearer ')) return null;
	return h.slice(7).trim() || null;
}
