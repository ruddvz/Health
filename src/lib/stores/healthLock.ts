import { browser } from '$app/environment';
import { writable, get, derived } from 'svelte/store';
import {
	clearSecurityConfig,
	loadSecurityConfig,
	saveSecurityConfig
} from '$lib/security/config';
import { hashPin, validatePinFormat, verifyPin } from '$lib/security/crypto';
import {
	clearPinFailures,
	pinLockoutMessage,
	recordPinFailure
} from '$lib/security/pinRateLimit';
import { consumeRecoveryCode } from '$lib/security/recoveryCodes';
import { isLockSetupComplete } from '$lib/security/setupValidation';
import {
	clearVaultRecords,
	isVaultEncrypted,
	loadWrappedDek,
	migratePlaintextToVault,
	unwrapDekForPin
} from '$lib/security/vault';
import { authenticatePlatformLock, registerPlatformLock } from '$lib/security/webauthnLocal';
import type { HealthSecurityConfig } from '$lib/security/types';
import { DEFAULT_SECURITY_CONFIG } from '$lib/security/types';
import { idbClearAll } from '$lib/security/indexedDb';
import { hydrateFromVaultSnapshot, persistAllToVault } from '$lib/stores/vaultBridge';

export const securityConfig = writable<HealthSecurityConfig>(DEFAULT_SECURITY_CONFIG());

let sessionUnlocked = false;
let unlockExpiresAt: number | null = null;
let vaultDek: CryptoKey | null = null;

export const lockSession = writable({ unlocked: false, expiresAt: null as number | null });

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
	if (cfg.autoLockMinutes < 0 || cfg.autoLockMinutes === 0) {
		unlockExpiresAt = null;
		syncSessionStore();
		return;
	}
	unlockExpiresAt = Date.now() + cfg.autoLockMinutes * 60_000;
	syncSessionStore();
}

export function hasVaultDek(): boolean {
	return vaultDek != null;
}

export function getVaultDek(): CryptoKey | null {
	return vaultDek;
}

export function needsPinToDecryptVault(): boolean {
	const cfg = get(securityConfig);
	return !!(cfg.encryptionEnabled && !vaultDek);
}

async function flushVaultIfNeeded() {
	if (!vaultDek || !get(securityConfig).encryptionEnabled) return;
	await persistAllToVault(vaultDek);
}

async function unlockVaultWithPin(pin: string): Promise<string | null> {
	const cfg = get(securityConfig);
	if (!cfg.pin) return 'Recovery PIN is not configured.';
	const wrapped = await loadWrappedDek();
	if (!wrapped) return null;
	try {
		vaultDek = await unwrapDekForPin(pin, wrapped);
		const snap = await import('$lib/security/vault').then((m) =>
			m.exportVaultSnapshot(vaultDek!)
		);
		hydrateFromVaultSnapshot(snap);
		return null;
	} catch {
		return 'Could not decrypt your data. Check your recovery PIN.';
	}
}

export function hydrateSecurity() {
	if (!browser) return;
	const cfg = loadSecurityConfig();
	securityConfig.set(cfg);
	vaultDek = null;
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
		vaultDek = null;
	} else if (!opts?.keepUnlocked) {
		sessionUnlocked = false;
		unlockExpiresAt = null;
		void flushVaultIfNeeded().finally(() => {
			vaultDek = null;
		});
	}
	syncSessionStore();
	return next;
}

export function isSessionUnlocked(): boolean {
	if (!get(securityConfig).enabled) return true;
	if (!sessionUnlocked) return false;
	if (unlockExpiresAt != null && Date.now() > unlockExpiresAt) {
		void flushVaultIfNeeded().finally(() => {
			sessionUnlocked = false;
			unlockExpiresAt = null;
			vaultDek = null;
			syncSessionStore();
		});
		return false;
	}
	return true;
}

export async function unlockWithPin(pin: string): Promise<string | null> {
	const lockMsg = pinLockoutMessage();
	if (lockMsg) return lockMsg;

	const cfg = get(securityConfig);
	if (!cfg.pin) return 'Recovery PIN is not configured.';
	const ok = await verifyPin(pin, cfg.pin);
	if (!ok) {
		recordPinFailure();
		return pinLockoutMessage() ?? 'Incorrect PIN.';
	}
	clearPinFailures();

	if (cfg.encryptionEnabled) {
		const vaultErr = await unlockVaultWithPin(pin);
		if (vaultErr) return vaultErr;
	}

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

	if (cfg.encryptionEnabled && !vaultDek) {
		return 'Passkey verified. Enter your recovery PIN below to load encrypted data.';
	}

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

export async function enablePasskeyLock(opts: {
	recoveryPin: string;
	recoveryCodeHashes: string[];
	keepUnlocked?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	const pinErr = validatePinFormat(opts.recoveryPin);
	if (pinErr) return { ok: false, error: pinErr };
	if (opts.recoveryCodeHashes.length < 1) {
		return { ok: false, error: 'Save recovery codes before enabling Health Lock.' };
	}

	const reg = await registerPlatformLock('local');
	if (!reg.ok) return reg;

	const pinCred = await hashPin(opts.recoveryPin);
	const cur = get(securityConfig);

	let encryptionEnabled = false;
	try {
		vaultDek = await migratePlaintextToVault(opts.recoveryPin, pinCred);
		encryptionEnabled = true;
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Encryption setup failed.';
		return { ok: false, error: msg };
	}

	const next: HealthSecurityConfig = {
		...cur,
		enabled: true,
		pin: pinCred,
		webauthn: reg.meta,
		method: 'pin+biometric',
		recoveryCodeHashes: opts.recoveryCodeHashes,
		encryptionEnabled
	};
	persistSecurity(next, { keepUnlocked: opts.keepUnlocked ?? true });
	return { ok: true };
}

export async function enablePinLock(opts: {
	recoveryPin: string;
	recoveryCodeHashes: string[];
	withPasskey?: boolean;
	keepUnlocked?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	const pinErr = validatePinFormat(opts.recoveryPin);
	if (pinErr) return { ok: false, error: pinErr };
	if (opts.recoveryCodeHashes.length < 1) {
		return { ok: false, error: 'Generate recovery codes first.' };
	}

	const pinCred = await hashPin(opts.recoveryPin);
	let webauthn = get(securityConfig).webauthn;
	if (opts.withPasskey) {
		const reg = await registerPlatformLock('local');
		if (!reg.ok) return reg;
		webauthn = reg.meta;
	}

	let encryptionEnabled = false;
	try {
		vaultDek = await migratePlaintextToVault(opts.recoveryPin, pinCred);
		encryptionEnabled = true;
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Encryption setup failed.';
		return { ok: false, error: msg };
	}

	const cur = get(securityConfig);
	const next: HealthSecurityConfig = {
		...cur,
		enabled: true,
		pin: pinCred,
		webauthn,
		method: webauthn ? 'pin+biometric' : 'pin',
		recoveryCodeHashes: opts.recoveryCodeHashes,
		encryptionEnabled
	};
	persistSecurity(next, { keepUnlocked: opts.keepUnlocked ?? true });
	return { ok: true };
}

export function removePasskeyFromDevice() {
	const cur = get(securityConfig);
	const next: HealthSecurityConfig = {
		...cur,
		webauthn: undefined,
		method: cur.pin ? 'pin' : 'none',
		enabled: !!cur.pin && isLockSetupComplete({ ...cur, webauthn: undefined })
	};
	if (!next.pin) next.enabled = false;
	persistSecurity(next, { keepUnlocked: true });
}

export function lockNow() {
	void flushVaultIfNeeded().finally(() => {
		sessionUnlocked = false;
		unlockExpiresAt = null;
		vaultDek = null;
		syncSessionStore();
	});
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
	await flushVaultIfNeeded();
	clearSecurityConfig();
	await clearVaultRecords();
	await idbClearAll();
	securityConfig.set(DEFAULT_SECURITY_CONFIG());
	sessionUnlocked = true;
	unlockExpiresAt = null;
	vaultDek = null;
	syncSessionStore();
}

export async function ensureEncryptionMigrated(pin: string): Promise<string | null> {
	const cfg = get(securityConfig);
	if (!cfg.pin || cfg.encryptionEnabled) return null;
	if (!(await isVaultEncrypted())) {
		try {
			vaultDek = await migratePlaintextToVault(pin, cfg.pin);
			persistSecurity({ ...cfg, encryptionEnabled: true }, { keepUnlocked: true });
		} catch {
			return 'Could not enable encryption.';
		}
	}
	return null;
}
