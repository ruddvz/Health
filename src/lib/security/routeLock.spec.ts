import { describe, it, expect } from 'vitest';
import { isLockExemptPath, isLockProtectedPath } from '$lib/security/routeLock';

describe('route lock', () => {
	it('exempts onboarding, import, and security setup', () => {
		expect(isLockExemptPath('/')).toBe(true);
		expect(isLockExemptPath('/import')).toBe(true);
		expect(isLockExemptPath('/system/security')).toBe(true);
	});

	it('protects app routes including system hub', () => {
		expect(isLockProtectedPath('/today')).toBe(true);
		expect(isLockProtectedPath('/system')).toBe(true);
		expect(isLockProtectedPath('/system/settings')).toBe(true);
		expect(isLockProtectedPath('/system/security')).toBe(false);
		expect(isLockProtectedPath('/')).toBe(false);
	});
});
