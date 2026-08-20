import { describe, expect, it } from 'vitest';
import { analyzeTraining } from './trainingCoach';
import type { ProgressV2, WorkoutSessionLog } from '$lib/types/planV2';

function benchSession(
	daysAgo: number,
	weightKg: number,
	reps: string,
	rir?: string
): WorkoutSessionLog {
	const finishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
	return {
		id: `s-${daysAgo}`,
		dayIndex: 0,
		startedAt: finishedAt,
		finishedAt,
		exercises: [
			{
				name: 'Bench Press',
				sets: [{ weight_kg: String(weightKg), reps, rir, done: true }]
			}
		]
	};
}

describe('analyzeTraining', () => {
	it('returns no insights with no sessions', () => {
		expect(analyzeTraining({})).toEqual({ insights: [], ignoredPatterns: [], nudge: null });
	});

	it('ignores a pattern with fewer than 3 sessions in the window', () => {
		const progress: ProgressV2 = {
			workoutSessions: [benchSession(20, 100, '8'), benchSession(10, 102.5, '8')]
		};
		const result = analyzeTraining(progress);
		expect(result.insights).toHaveLength(0);
		expect(result.ignoredPatterns[0]?.pattern).toBe('horizontal_push');
	});

	it('flags a rising lift with RIR >= 2 as ready to add load', () => {
		const progress: ProgressV2 = {
			workoutSessions: [
				benchSession(20, 100, '8', '3'),
				benchSession(13, 102.5, '8', '3'),
				benchSession(6, 105, '8', '2')
			]
		};
		const result = analyzeTraining(progress);
		expect(result.insights).toHaveLength(1);
		expect(result.insights[0].status).toBe('rising');
		expect(result.insights[0].prescription).toMatch(/Add 2.5 kg/);
	});

	it('flags a rising lift with low RIR as repeat', () => {
		const progress: ProgressV2 = {
			workoutSessions: [
				benchSession(20, 100, '8', '0'),
				benchSession(13, 102.5, '8', '0'),
				benchSession(6, 105, '8', '0')
			]
		};
		const result = analyzeTraining(progress);
		expect(result.insights[0].status).toBe('rising');
		expect(result.insights[0].prescription).toBe('Repeat last session exactly.');
	});

	it('flags a flat e1RM as stalled', () => {
		const progress: ProgressV2 = {
			workoutSessions: [
				benchSession(20, 100, '8'),
				benchSession(13, 100, '8'),
				benchSession(6, 100, '8')
			]
		};
		const result = analyzeTraining(progress);
		expect(result.insights[0].status).toBe('stalled');
		expect(result.insights[0].prescription).toBe('Hold the load, add one rep to every set.');
	});

	it('reclassifies a stall as a food problem when bodyweight is dropping fast', () => {
		const progress: ProgressV2 = {
			workoutSessions: [
				benchSession(20, 100, '8'),
				benchSession(13, 100, '8'),
				benchSession(6, 100, '8')
			],
			weightEntries: Array.from({ length: 6 }, (_, i) => ({
				date: new Date(Date.now() - (25 - i * 5) * 24 * 60 * 60 * 1000).toISOString(),
				kg: 90 - i * 0.5
			}))
		};
		const result = analyzeTraining(progress);
		expect(result.insights[0].status).toBe('food_problem');
	});

	it('nudges when no session has landed in longer than the median gap', () => {
		const progress: ProgressV2 = {
			workoutSessions: [
				benchSession(60, 100, '8'),
				benchSession(50, 100, '8'),
				benchSession(40, 100, '8')
			]
		};
		const result = analyzeTraining(progress);
		expect(result.nudge).toMatch(/No session logged/);
	});
});
