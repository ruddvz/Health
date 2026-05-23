import { describe, it, expect } from 'vitest';
import { getRpId } from '$lib/security/rpOrigin';

describe('rpOrigin', () => {
	it('uses localhost in dev', () => {
		expect(getRpId('localhost')).toBe('localhost');
	});

	it('uses full host for github pages', () => {
		expect(getRpId('ruddvz.github.io')).toBe('ruddvz.github.io');
	});

	it('uses registrable suffix for custom domains', () => {
		expect(getRpId('app.example.com')).toBe('example.com');
	});
});
