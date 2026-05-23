import { browser } from '$app/environment';
import { writable, get, derived } from 'svelte/store';
import { idbClearAll } from '$lib/security/indexedDb';
import {
	clearSecurityConfig,
	loadSecurityConfig,
	saveSecurityConfig
} from '$lib/security/config';
import { hashPin, validatePinFormat, verifyPin } from '$lib/security/crypto';
import { consumeRecoveryCode } from '$lib/security/recoveryCodes';
import { authenticatePlatformLock, registerPlatformLock } from '$lib/security/webauthnLocal';
import type { HealthSecurityConfig } from '$lib/security/types';
import { DEFAULT_SECURITY_CONFIG } from '$lib/security/types';

export const securityConfig = writable<HealthSecurityConfig>(DEFAULT_SECURITY_CONFIG());

/** In-memory session only — never persisted. */
let sessionUnlocked = false;
let unlockExpiresAt: number | null = null;

export const lockSession = writable({ unlocked: false, expiresAt: null as number | null });

/** Reactive: true when Health Lock is on and the user must authenticate. */
export const requiresUnlock = derived([securityConfig, lockSession], ([cfg, sess]) => {
	if (!cfg.enabled) return false;
	if (!sess.unlocked) return true;
	if (sess.expiresAt != null && Date.now() > sess.expiresAt) return true;
	return false;
});

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
	if (!cfg.enabled) {
		sessionUnlocked = true;
	} else if (cfg.lockOnColdStart) {
		sessionUnlocked = false;
	} else {
		sessionUnlocked = true;
	}
	syncSessionStore();
}

export function persistSecurity(
	cfg: HealthSecurityConfig,
	opts?: { keepUnlocked?: boolean }
) {
	const next = saveSecurityConfig(cfg);
	securityConfig.set(next);
	if (!next.enabled) {
		sessionUnlocked = true;
		unlockExpiresAt = null;
	} else if (!opts?.keepUnlocked) {
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
	if (!cfg.webauthn) return 'Passkey is not configured on this device.';
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
	saveSecurityConfig(next);
	securityConfig.set(next);
	sessionUnlocked = true;
	scheduleAutoLock(next);
	syncSessionStore();
	return null;
}

/** Register platform passkey and enable lock (Phase 1 local app lock). */
export async function enablePasskeyLock(opts?: {
	recoveryPin?: string;
	keepUnlocked?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	const reg = await registerPlatformLock('local');
	if (!reg.ok) return reg;

	const cur = get(securityConfig);
	let pin = cur.pin;
	if (opts?.recoveryPin) {
		const err = validatePinFormat(opts.recoveryPin);
		if (err) return { ok: false, error: err };
		pin = await hashPin(opts.recoveryPin);
	}

	const next: HealthSecurityConfig = {
		...cur,
		enabled: true,
		webauthn: reg.meta,
		pin,
		method: pin ? 'pin+biometric' : 'biometric'
	};
	persistSecurity(next, { keepUnlocked: opts?.keepUnlocked ?? true });
	return { ok: true };
}

export function removePasskeyFromDevice() {
	const cur = get(securityConfig);
	const next: HealthSecurityConfig = {
		...cur,
		webauthn: undefined,
		enabled: !!(cur.pin || cur.recoveryCodeHashes.length),
		method: cur.pin ? 'pin' : 'none'
	};
	if (!next.pin) next.enabled = false;
	persistSecurity(next, { keepUnlocked: true });
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
	if (!cfg.enabled) return;
	if (!isSessionUnlocked()) {
		lockNow();
		return;
	}
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
