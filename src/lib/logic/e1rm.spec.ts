import { describe, expect, it } from 'vitest';
import { calcE1RM, e1rmFromSet } from './e1rm';

describe('e1rm', () => {
	it('applies the Epley formula', () => {
		expect(calcE1RM(225, 8)).toBeCloseTo(225 * (1 + 8 / 30), 5);
		expect(calcE1RM(100, 0)).toBeNull();
		expect(calcE1RM(0, 5)).toBeNull();
		expect(calcE1RM(NaN, 5)).toBeNull();
	});

	it('parses set strings before computing e1RM', () => {
		expect(e1rmFromSet('100', '8')).toBeCloseTo(100 * (1 + 8 / 30), 5);
		expect(e1rmFromSet('', '8')).toBeNull();
		expect(e1rmFromSet('100', undefined)).toBeNull();
		expect(e1rmFromSet('100,5', '5')).toBeCloseTo(100.5 * (1 + 5 / 30), 5);
	});
});
