import { describe, it, expect } from 'vitest';
import { normalizeSecurityConfig } from '$lib/security/config';

describe('security config', () => {
	it('infers lock method from credentials', () => {
		const cfg = normalizeSecurityConfig({
			enabled: true,
			pin: { hashB64: 'a', saltB64: 'b', iterations: 210_000 },
			webauthn: { credentialIdB64: 'cid', createdAt: '2026-01-01', tier: 'local' }
		});
		expect(cfg.method).toBe('pin+biometric');
	});
});
