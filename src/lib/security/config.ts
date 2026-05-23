import { browser } from '$app/environment';
import { LS_SECURITY } from '$lib/constants/storage';
import {
	DEFAULT_SECURITY_CONFIG,
	type HealthSecurityConfig,
	type LockMethod
} from '$lib/security/types';

function inferMethod(cfg: HealthSecurityConfig): LockMethod {
	if (!cfg.enabled) return 'none';
	const hasPin = !!cfg.pin;
	const hasBio = !!cfg.webauthn;
	if (hasPin && hasBio) return 'pin+biometric';
	if (hasPin) return 'pin';
	if (hasBio) return 'biometric';
	return 'none';
}

export function normalizeSecurityConfig(raw: unknown): HealthSecurityConfig {
	const base = DEFAULT_SECURITY_CONFIG();
	if (!raw || typeof raw !== 'object') return base;
	const o = raw as Record<string, unknown>;
	const cfg: HealthSecurityConfig = {
		...base,
		version: 1,
		enabled: o.enabled === true,
		method: 'none',
		recoveryCodeHashes: Array.isArray(o.recoveryCodeHashes)
			? o.recoveryCodeHashes.filter((h): h is string => typeof h === 'string')
			: [],
		autoLockMinutes:
			typeof o.autoLockMinutes === 'number' && Number.isFinite(o.autoLockMinutes)
				? Math.floor(o.autoLockMinutes)
				: base.autoLockMinutes,
		lockOnColdStart: o.lockOnColdStart !== false,
		updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : base.updatedAt
	};
	if (o.pin && typeof o.pin === 'object') {
		const p = o.pin as Record<string, unknown>;
		if (typeof p.hashB64 === 'string' && typeof p.saltB64 === 'string') {
			cfg.pin = {
				hashB64: p.hashB64,
				saltB64: p.saltB64,
				iterations: typeof p.iterations === 'number' ? p.iterations : 210_000
			};
		}
	}
	if (o.webauthn && typeof o.webauthn === 'object') {
		const w = o.webauthn as Record<string, unknown>;
		if (typeof w.credentialIdB64 === 'string') {
			cfg.webauthn = {
				credentialIdB64: w.credentialIdB64,
				createdAt: typeof w.createdAt === 'string' ? w.createdAt : new Date().toISOString(),
				tier: w.tier === 'synced' ? 'synced' : 'local'
			};
		}
	}
	cfg.method = inferMethod(cfg);
	return cfg;
}

export function loadSecurityConfig(): HealthSecurityConfig {
	if (!browser) return DEFAULT_SECURITY_CONFIG();
	try {
		const raw = localStorage.getItem(LS_SECURITY);
		if (!raw) return DEFAULT_SECURITY_CONFIG();
		return normalizeSecurityConfig(JSON.parse(raw));
	} catch {
		return DEFAULT_SECURITY_CONFIG();
	}
}

export function saveSecurityConfig(cfg: HealthSecurityConfig): HealthSecurityConfig {
	const next = { ...cfg, method: inferMethod(cfg), updatedAt: new Date().toISOString() };
	if (browser) localStorage.setItem(LS_SECURITY, JSON.stringify(next));
	return next;
}

export function clearSecurityConfig(): void {
	if (browser) localStorage.removeItem(LS_SECURITY);
}
