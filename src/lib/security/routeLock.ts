import { pathStartsWith } from '$lib/paths';

/** Routes reachable while Health Lock is active (setup / onboarding). */
export const LOCK_EXEMPT_PATHS = ['/', '/import', '/system/security'] as const;

/** App areas gated when lock is enabled. */
export const LOCK_PROTECTED_PREFIXES = [
	'/today',
	'/meals',
	'/train',
	'/progress',
	'/system'
] as const;

export function isLockExemptPath(pathname: string): boolean {
	if (pathname === '/' || pathStartsWith(pathname, '/import')) return true;
	if (pathStartsWith(pathname, '/system/security')) return true;
	return false;
}

export function isLockProtectedPath(pathname: string): boolean {
	if (isLockExemptPath(pathname)) return false;
	return LOCK_PROTECTED_PREFIXES.some((prefix) => pathStartsWith(pathname, prefix));
}
