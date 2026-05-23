import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { idbClearAll } from '$lib/security/indexedDb';
import {
	clearSecurityConfig,
	loadSecurityConfig,
	saveSecurityConfig
} from '$lib/security/config';
import { verifyPin } from '$lib/security/crypto';
import { consumeRecoveryCode } from '$lib/security/recoveryCodes';
import { authenticatePlatformLock } from '$lib/security/webauthnLocal';
import type { HealthSecurityConfig } from '$lib/security/types';
import { DEFAULT_SECURITY_CONFIG } from '$lib/security/types';

export const securityConfig = writable<HealthSecurityConfig>(DEFAULT_SECURITY_CONFIG());

/** In-memory session only — never persisted. */
let sessionUnlocked = false;
let unlockExpiresAt: number | null = null;

export const lockSession = writable({ unlocked: false, expiresAt: null as number | null });

function syncSessionStore() {
	lockSession.set({ unlocked: sessionUnlocked, expiresAt: unlockExpiresAt });
}

function scheduleAutoLock(cfg: HealthSecurityConfig) {
	if (!browser || !sessionUnlocked) return;
	if (cfg.autoLockMinutes < 0) {
		unlockExpiresAt = null;
		syncSessionStore();
		return;
	}
	if (cfg.autoLockMinutes === 0) {
		unlockExpiresAt = null;
		syncSessionStore();
		return;
	}
	unlockExpiresAt = Date.now() + cfg.autoLockMinutes * 60_000;
	syncSessionStore();
}

export function hydrateSecurity() {
	if (!browser) return;
	const cfg = loadSecurityConfig();
	securityConfig.set(cfg);
	if (cfg.enabled && cfg.lockOnColdStart) {
		sessionUnlocked = false;
	} else if (!cfg.enabled) {
		sessionUnlocked = true;
	}
	syncSessionStore();
}

export function persistSecurity(cfg: HealthSecurityConfig) {
	const next = saveSecurityConfig(cfg);
	securityConfig.set(next);
	if (!next.enabled) {
		sessionUnlocked = true;
		unlockExpiresAt = null;
	} else {
		sessionUnlocked = false;
		unlockExpiresAt = null;
	}
	syncSessionStore();
	return next;
}

export function isSessionUnlocked(): boolean {
	if (!get(securityConfig).enabled) return true;
	if (!sessionUnlocked) return false;
	if (unlockExpiresAt != null && Date.now() > unlockExpiresAt) {
		sessionUnlocked = false;
		unlockExpiresAt = null;
		syncSessionStore();
		return false;
	}
	return true;
}

export function needsUnlockForPath(pathname: string, protectedPath: boolean): boolean {
	const cfg = get(securityConfig);
	if (!cfg.enabled || !protectedPath) return false;
	return !isSessionUnlocked();
}

export async function unlockWithPin(pin: string): Promise<string | null> {
	const cfg = get(securityConfig);
	if (!cfg.pin) return 'PIN is not configured.';
	const ok = await verifyPin(pin, cfg.pin);
	if (!ok) return 'Incorrect PIN.';
	sessionUnlocked = true;
	scheduleAutoLock(cfg);
	syncSessionStore();
	return null;
}

export async function unlockWithBiometric(): Promise<string | null> {
	const cfg = get(securityConfig);
	if (!cfg.webauthn) return 'Biometric lock is not configured.';
	const r = await authenticatePlatformLock(cfg.webauthn);
	if (!r.ok) return r.error;
	sessionUnlocked = true;
	scheduleAutoLock(cfg);
	syncSessionStore();
	return null;
}

export async function unlockWithRecoveryCode(code: string): Promise<string | null> {
	const cfg = get(securityConfig);
	const next = await consumeRecoveryCode(cfg, code);
	if (!next) return 'Invalid or already used recovery code.';
	persistSecurity(next);
	sessionUnlocked = true;
	scheduleAutoLock(next);
	syncSessionStore();
	return null;
}

export function lockNow() {
	sessionUnlocked = false;
	unlockExpiresAt = null;
	syncSessionStore();
}

export function lockOnHidden() {
	const cfg = get(securityConfig);
	if (!cfg.enabled) return;
	if (cfg.autoLockMinutes === 0) lockNow();
}

export function touchSession() {
	const cfg = get(securityConfig);
	if (!sessionUnlocked || !cfg.enabled) return;
	scheduleAutoLock(cfg);
}

export async function clearAllSecurityData() {
	clearSecurityConfig();
	await idbClearAll();
	securityConfig.set(DEFAULT_SECURITY_CONFIG());
	sessionUnlocked = true;
	unlockExpiresAt = null;
	syncSessionStore();
}
