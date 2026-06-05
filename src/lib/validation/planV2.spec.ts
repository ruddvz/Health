import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validatePlanUnknown } from './planV2';

const samplePath = join(process.cwd(), 'samples/minimal-plan-v2.json');

describe('validatePlanUnknown issues', () => {
	it('flags duplicate phase ids', () => {
		const raw = JSON.parse(readFileSync(samplePath, 'utf8')) as Record<string, unknown>;
		const phases = [...(raw.phases as unknown[])];
		const clone = { ...(phases[0] as Record<string, unknown>) };
		phases.push(clone);
		raw.phases = phases;
		const r = validatePlanUnknown(raw);
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.issues.some((i) => i.code === 'DUPLICATE_PHASE_ID')).toBe(true);
		}
	});

	it('warns when allergies missing', () => {
		const raw = JSON.parse(readFileSync(samplePath, 'utf8')) as Record<string, unknown>;
		const user = { ...(raw.user as Record<string, unknown>) };
		delete user.allergies;
		raw.user = user;
		const r = validatePlanUnknown(raw);
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.issues.some((i) => i.code === 'MISSING_ALLERGIES')).toBe(true);
		}
	});

	it('rejects unsafe calorie targets', () => {
		const raw = JSON.parse(readFileSync(samplePath, 'utf8')) as Record<string, unknown>;
		const phases = [...(raw.phases as unknown[])];
		const ph = phases[0] as Record<string, unknown>;
		ph.kcal_daily = 400;
		ph.kcal_workout_day = 400;
		ph.kcal_rest_day = 400;
		raw.phases = phases;
		const r = validatePlanUnknown(raw);
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.issues.some((i) => i.code === 'UNSAFE_CALORIES')).toBe(true);
		}
	});
});
