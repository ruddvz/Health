import { describe, it, expect } from 'vitest';
import { parsePlanJsonText } from '$lib/validation/planV2';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('plan storage parse errors', () => {
	it('returns parse error message for invalid JSON text', () => {
		const r = parsePlanJsonText('{not valid');
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error).toMatch(/JSON parse error/i);
		}
	});

	it('accepts bundled minimal sample plan', () => {
		const text = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');
		const r = parsePlanJsonText(text);
		expect(r.ok).toBe(true);
	});
});
