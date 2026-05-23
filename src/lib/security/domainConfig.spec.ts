import { describe, it, expect, vi } from 'vitest';

describe('domainConfig', () => {
	it('reads configured API URL from env', async () => {
		vi.stubEnv('PUBLIC_HEALTH_API_URL', 'https://api.example.com');
		const { cloudApiBaseUrl, isCloudApiConfigured } = await import('$lib/security/domainConfig');
		expect(cloudApiBaseUrl()).toBe('https://api.example.com');
		expect(isCloudApiConfigured()).toBe(true);
		vi.unstubAllEnvs();
	});
});
