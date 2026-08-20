import { describe, expect, it } from 'vitest';
import { classifyExercisePattern, isCompoundPattern } from './exercisePattern';

describe('exercisePattern', () => {
	it('classifies common exercise names', () => {
		expect(classifyExercisePattern('Barbell Bench Press')).toBe('horizontal_push');
		expect(classifyExercisePattern('Overhead Press')).toBe('vertical_push');
		expect(classifyExercisePattern('Barbell Row')).toBe('horizontal_pull');
		expect(classifyExercisePattern('Lat Pulldown')).toBe('vertical_pull');
		expect(classifyExercisePattern('Romanian Deadlift')).toBe('hinge');
		expect(classifyExercisePattern('Back Squat')).toBe('squat');
		expect(classifyExercisePattern("Farmer's Carry")).toBe('carry');
		expect(classifyExercisePattern('Bicep Curl')).toBe('isolation');
	});

	it('treats only isolation as non-compound', () => {
		expect(isCompoundPattern('squat')).toBe(true);
		expect(isCompoundPattern('isolation')).toBe(false);
	});
});
