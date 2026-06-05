import { corsHeaders, jsonResponse } from './http.js';

const buckets = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_LIMIT = 30;
const WINDOW_MS = 60_000;

export function clientKey(request: Request, route: string): string {
	const forwarded = request.headers.get('x-forwarded-for');
	const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
	return `${route}:${ip}`;
}

/** Simple in-memory rate limit per route + IP (suitable for serverless warm instances). */
export function checkRateLimit(
	request: Request,
	route: string,
	limit = DEFAULT_LIMIT,
	windowMs = WINDOW_MS
): { ok: true } | { ok: false; retryAfterSec: number } {
	const key = clientKey(request, route);
	const now = Date.now();
	let bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		bucket = { count: 0, resetAt: now + windowMs };
		buckets.set(key, bucket);
	}
	bucket.count += 1;
	if (bucket.count > limit) {
		const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
		return { ok: false, retryAfterSec };
	}
	return { ok: true };
}

export function rateLimitResponse(request: Request, retryAfterSec: number): Response {
	const res = jsonResponse(
		request,
		{ ok: false, error: 'Too many requests. Try again shortly.' },
		429
	);
	const headers = new Headers(res.headers);
	headers.set('Retry-After', String(retryAfterSec));
	return new Response(res.body, { status: 429, headers });
}

export { corsHeaders };
