import { describe, expect, it } from 'vitest';
import { QUICK_FIX_PRESETS } from './quickFixPresets';

describe('QUICK_FIX_PRESETS', () => {
	it('includes realistic macro add-ons', () => {
		expect(QUICK_FIX_PRESETS.length).toBeGreaterThanOrEqual(4);
		for (const p of QUICK_FIX_PRESETS) {
			expect(p.kcal).toBeGreaterThan(0);
			expect(p.protein_g).toBeGreaterThanOrEqual(0);
			expect(p.label.length).toBeGreaterThan(2);
		}
	});

	it('whey scoop is high protein', () => {
		const whey = QUICK_FIX_PRESETS.find((p) => p.label.includes('Whey'));
		expect(whey?.protein_g).toBeGreaterThanOrEqual(20);
	});
});
