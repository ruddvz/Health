import { describe, expect, it } from 'vitest';
import { collectPlanWarnings } from '$lib/logic/planWarnings';
import type { PlanV2 } from '$lib/types/planV2';

describe('collectPlanWarnings', () => {
	it('returns empty for null plan', () => {
		expect(collectPlanWarnings(null)).toEqual([]);
	});

	it('flags high water target', () => {
		const plan = {
			meta: {},
			user: {},
			phases: [{ id: 1, protein_g: 150 }],
			meal_plan: { workout_day: [], rest_day: [] },
			prep_guide: {},
			grocery: {},
			supplements: {},
			water_target_litres: 5
		} as unknown as PlanV2;
		const w = collectPlanWarnings(plan);
		expect(w.some((x) => x.includes('4 L'))).toBe(true);
	});
});
