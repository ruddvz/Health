import { describe, it, expect } from 'vitest';
import {
	generateRecoveryCodes,
	hashPin,
	hashRecoveryCode,
	normalizeRecoveryCode,
	validatePinFormat,
	verifyPin
} from '$lib/security/crypto';

describe('security crypto', () => {
	it('validates PIN format', () => {
		expect(validatePinFormat('1234')).toBeNull();
		expect(validatePinFormat('123')).toMatch(/4–8/);
		expect(validatePinFormat('12ab')).toMatch(/4–8/);
	});

	it('hashes and verifies PIN', async () => {
		const cred = await hashPin('4242');
		expect(await verifyPin('4242', cred)).toBe(true);
		expect(await verifyPin('0000', cred)).toBe(false);
	});

	it('normalizes recovery codes', () => {
		expect(normalizeRecoveryCode('ab cd-ef12')).toBe('ABCDEF12');
	});

	it('hashes recovery codes consistently', async () => {
		const a = await hashRecoveryCode('ABCD-EF12');
		const b = await hashRecoveryCode('abcdef12');
		expect(a).toBe(b);
	});

	it('generates unique-looking recovery codes', () => {
		const codes = generateRecoveryCodes(4);
		expect(codes).toHaveLength(4);
		for (const c of codes) expect(c).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
	});
});
