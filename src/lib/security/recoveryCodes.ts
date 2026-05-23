import { generateRecoveryCodes, hashRecoveryCode, normalizeRecoveryCode } from '$lib/security/crypto';
import type { HealthSecurityConfig } from '$lib/security/types';

export async function createRecoveryCodeSet(): Promise<{
	codes: string[];
	configHashes: string[];
}> {
	const codes = generateRecoveryCodes(8);
	const configHashes: string[] = [];
	for (const code of codes) {
		configHashes.push(await hashRecoveryCode(code));
	}
	return { codes, configHashes };
}

/** Consume a matching recovery code hash (returns updated hashes or null if invalid). */
export async function consumeRecoveryCode(
	config: HealthSecurityConfig,
	input: string
): Promise<HealthSecurityConfig | null> {
	const digest = await hashRecoveryCode(input);
	const idx = config.recoveryCodeHashes.indexOf(digest);
	if (idx < 0) return null;
	const next = [...config.recoveryCodeHashes];
	next.splice(idx, 1);
	return { ...config, recoveryCodeHashes: next, updatedAt: new Date().toISOString() };
}

export function formatRecoveryCodeForDisplay(code: string): string {
	return normalizeRecoveryCode(code).replace(/(.{4})/g, '$1-').replace(/-$/, '');
}
