/** How the app is protected on this device (static PWA — no server verification). */
export type LockMethod = 'none' | 'pin' | 'biometric' | 'pin+biometric';

/**
 * Local app lock vs future synced passkeys.
 * - `local`: platform authenticator only; challenge verified in-browser (privacy screen).
 * - `synced`: requires backend WebAuthn verification (not available on GitHub Pages alone).
 */
export type PasskeyTier = 'local' | 'synced';

export interface PinCredential {
	/** base64 PBKDF2 hash */
	hashB64: string;
	/** base64 salt */
	saltB64: string;
	iterations: number;
}

export interface WebAuthnCredentialMeta {
	/** base64url credential id */
	credentialIdB64: string;
	createdAt: string;
	tier: PasskeyTier;
}

export interface HealthSecurityConfig {
	version: 1;
	enabled: boolean;
	method: LockMethod;
	pin?: PinCredential;
	webauthn?: WebAuthnCredentialMeta;
	/** SHA-256 hex digests of normalized recovery codes (one-time use). */
	recoveryCodeHashes: string[];
	/** Minutes until auto-lock; 0 = lock when tab hidden; -1 = never auto-lock from timer */
	autoLockMinutes: number;
	/** Lock again when the PWA is opened after being closed */
	lockOnColdStart: boolean;
	/** Plan/progress stored encrypted in IndexedDB (requires recovery PIN). */
	encryptionEnabled?: boolean;
	updatedAt: string;
}

export const DEFAULT_SECURITY_CONFIG = (): HealthSecurityConfig => ({
	version: 1,
	enabled: false,
	method: 'none',
	recoveryCodeHashes: [],
	autoLockMinutes: 5,
	lockOnColdStart: true,
	updatedAt: new Date().toISOString()
});
