export type ExercisePattern =
	| 'horizontal_push'
	| 'vertical_push'
	| 'horizontal_pull'
	| 'vertical_pull'
	| 'hinge'
	| 'squat'
	| 'carry'
	| 'isolation';

const RULES: { pattern: ExercisePattern; keywords: string[] }[] = [
	{
		pattern: 'squat',
		keywords: ['squat', 'leg press', 'lunge', 'split squat', 'step up', 'step-up']
	},
	{
		pattern: 'hinge',
		keywords: [
			'deadlift',
			'rdl',
			'romanian',
			'hip thrust',
			'good morning',
			'hyperextension',
			'hinge'
		]
	},
	{
		pattern: 'vertical_pull',
		keywords: ['pulldown', 'pull-up', 'pullup', 'pull up', 'chin-up', 'chinup', 'chin up']
	},
	{
		pattern: 'horizontal_pull',
		keywords: ['row', 'face pull']
	},
	{
		pattern: 'vertical_push',
		keywords: [
			'overhead press',
			'shoulder press',
			'military press',
			'push press',
			'ohp',
			'arnold press'
		]
	},
	{
		pattern: 'horizontal_push',
		keywords: ['bench', 'chest press', 'push-up', 'push up', 'pushup', 'dip']
	},
	{
		pattern: 'carry',
		keywords: ['carry', 'farmer', "farmer's"]
	}
];

/** Coarse movement-pattern classification by keyword match on the exercise name; unmatched names are 'isolation'. */
export function classifyExercisePattern(name: string): ExercisePattern {
	const n = name.toLowerCase();
	for (const rule of RULES) {
		if (rule.keywords.some((kw) => n.includes(kw))) return rule.pattern;
	}
	return 'isolation';
}

const LABELS: Record<ExercisePattern, string> = {
	horizontal_push: 'Horizontal push',
	vertical_push: 'Vertical push',
	horizontal_pull: 'Horizontal pull',
	vertical_pull: 'Vertical pull',
	hinge: 'Hinge',
	squat: 'Squat',
	carry: 'Carry',
	isolation: 'Isolation'
};

export function patternLabel(pattern: ExercisePattern): string {
	return LABELS[pattern];
}

export function isCompoundPattern(pattern: ExercisePattern): boolean {
	return pattern !== 'isolation';
}
