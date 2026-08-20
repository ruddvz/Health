import { describe, expect, it } from 'vitest';
import { analyzeNutrition } from './nutritionCoach';
import { logicalDateKey, rollingLogicalDayKeys } from './dateKey';
import { mealSlotKey } from './mealSlots';
import type { PlanV2, ProgressV2 } from '$lib/types/planV2';

const plan: PlanV2 = {
	user: { weight_kg: 90 },
	phases: [{ protein_g: 200, carbs_g: 200, fat_g: 60, kcal_daily: 2200 }],
	meal_plan: {
		workout_day: [
			{
				slot: 1,
				time: '08:00',
				name: 'Breakfast',
				kcal: 500,
				protein_g: 40,
				carbs_g: 50,
				fat_g: 15
			},
			{ slot: 2, time: '13:00', name: 'Lunch', kcal: 600, protein_g: 45, carbs_g: 60, fat_g: 15 }
		]
	}
} as PlanV2;

describe('analyzeNutrition', () => {
	it('reports insufficient data with fewer than 4 logged days', () => {
		const now = new Date('2030-06-20T12:00:00Z');
		const { keys } = rollingLogicalDayKeys(now, {});
		const progress: ProgressV2 = {
			mealSlotStatus: {
				[mealSlotKey(keys[6], 'workout', 1)]: 'logged'
			}
		};
		const result = analyzeNutrition(plan, progress, {}, 'workout', now);
		expect(result.insufficientData).toBe(true);
		expect(result.daysWithLogs).toBe(1);
	});

	it('flags days under the protein floor and produces a change', () => {
		const now = new Date('2030-06-20T12:00:00Z');
		const { keys } = rollingLogicalDayKeys(now, {});
		const statuses: Record<string, 'logged'> = {};
		// Log only breakfast (40g protein) on 5 of the 7 days — well under the ~1.76 g/kg floor for 90kg.
		for (const k of keys.slice(2)) {
			statuses[mealSlotKey(k, 'workout', 1)] = 'logged';
		}
		const progress: ProgressV2 = { mealSlotStatus: statuses };
		const result = analyzeNutrition(plan, progress, {}, 'workout', now);
		expect(result.insufficientData).toBe(false);
		expect(result.daysWithLogs).toBe(5);
		expect(result.proteinFloorGPerDay).toBeCloseTo(90 * 1.7637, 2);
		expect(result.daysUnderProteinFloor).toBe(5);
		expect(result.gap).toBe('protein_floor');
		expect(result.message).toMatch(/Protein under floor/);
	});

	it('computes weight trend once at least 5 weigh-ins fall in the 14-day window', () => {
		const now = new Date('2030-06-20T12:00:00Z');
		const weightEntries = Array.from({ length: 5 }, (_, i) => ({
			date: logicalDateKey(new Date(now.getTime() - (12 - i * 3) * 24 * 60 * 60 * 1000), {}),
			kg: 90 - i * 0.2
		}));
		const progress: ProgressV2 = { weightEntries };
		const result = analyzeNutrition(plan, progress, {}, 'workout', now);
		expect(result.weightTrendKgPerWeek).not.toBeNull();
		expect(result.weightTrendKgPerWeek ?? 0).toBeLessThan(0);
	});
});
