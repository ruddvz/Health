import { describe, expect, it } from 'vitest';
import { leastSquaresSlope, leastSquaresSlopePerDay } from './linearRegression';

describe('linearRegression', () => {
	it('returns null with fewer than 2 points', () => {
		expect(leastSquaresSlope([])).toBeNull();
		expect(leastSquaresSlope([{ x: 0, y: 1 }])).toBeNull();
	});

	it('fits a perfect line', () => {
		const points = [
			{ x: 0, y: 0 },
			{ x: 1, y: 2 },
			{ x: 2, y: 4 },
			{ x: 3, y: 6 }
		];
		expect(leastSquaresSlope(points)).toBeCloseTo(2, 5);
	});

	it('returns 0 for flat data', () => {
		const points = [
			{ x: 0, y: 5 },
			{ x: 1, y: 5 },
			{ x: 2, y: 5 }
		];
		expect(leastSquaresSlope(points)).toBe(0);
	});

	it('fits weight entries by day, weekly slope example', () => {
		const entries = [
			{ date: '2026-01-01', value: 80 },
			{ date: '2026-01-08', value: 79 },
			{ date: '2026-01-15', value: 78 }
		];
		const perDay = leastSquaresSlopePerDay(entries);
		expect(perDay).not.toBeNull();
		expect((perDay ?? 0) * 7).toBeCloseTo(-1, 3);
	});
});
