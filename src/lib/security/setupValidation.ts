import type { HealthSecurityConfig } from '$lib/security/types';

export const MIN_RECOVERY_CODES = 1;

/** Lock must have a recovery PIN and at least one recovery code hash on file. */
export function isLockSetupComplete(cfg: HealthSecurityConfig): boolean {
	if (!cfg.enabled) return true;
	const hasPin = !!cfg.pin;
	const hasCodes = cfg.recoveryCodeHashes.length >= MIN_RECOVERY_CODES;
	const hasUnlockMethod = hasPin || !!cfg.webauthn;
	return hasUnlockMethod && hasPin && hasCodes;
}

export function lockSetupIncompleteMessage(cfg: HealthSecurityConfig): string | null {
	if (!cfg.enabled || isLockSetupComplete(cfg)) return null;
	if (!cfg.pin) return 'Set a recovery PIN (required for encrypted backups on this device).';
	if (cfg.recoveryCodeHashes.length < MIN_RECOVERY_CODES) {
		return 'Generate recovery codes before finishing setup.';
	}
	return 'Complete Health Lock setup in Security settings.';
}
