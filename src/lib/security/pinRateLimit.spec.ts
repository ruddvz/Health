import { describe, it, expect, beforeEach } from 'vitest';
import {
	clearPinFailures,
	isPinLockedOut,
	pinLockoutMessage,
	recordPinFailure
} from '$lib/security/pinRateLimit';

describe('pinRateLimit', () => {
	beforeEach(() => {
		clearPinFailures();
	});

	it('locks out after repeated failures', () => {
		for (let i = 0; i < 5; i++) recordPinFailure();
		expect(isPinLockedOut()).toBe(true);
		expect(pinLockoutMessage()).toMatch(/Too many attempts/);
	});
});
