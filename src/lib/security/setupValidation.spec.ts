import { describe, it, expect } from 'vitest';
import { isLockSetupComplete, lockSetupIncompleteMessage } from '$lib/security/setupValidation';
import { DEFAULT_SECURITY_CONFIG } from '$lib/security/types';

describe('setupValidation', () => {
	it('requires pin and codes when enabled', () => {
		const cfg = {
			...DEFAULT_SECURITY_CONFIG(),
			enabled: true,
			pin: { hashB64: 'a', saltB64: 'b', iterations: 210_000 },
			recoveryCodeHashes: ['abc']
		};
		expect(isLockSetupComplete(cfg)).toBe(true);
		expect(lockSetupIncompleteMessage(cfg)).toBeNull();
	});

	it('flags missing codes', () => {
		const cfg = {
			...DEFAULT_SECURITY_CONFIG(),
			enabled: true,
			pin: { hashB64: 'a', saltB64: 'b', iterations: 210_000 },
			recoveryCodeHashes: []
		};
		expect(isLockSetupComplete(cfg)).toBe(false);
	});
});
