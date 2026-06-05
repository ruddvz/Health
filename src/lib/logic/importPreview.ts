import type { PlanV2 } from '$lib/types/planV2';
import type { ValidationIssue } from '$lib/validation/issues';

export type ImportPreview = {
	title: string;
	goal: string;
	schemaVersion: string;
	phaseCount: number;
	workoutMeals: number;
	restMeals: number;
	trainingDays: number;
	workoutKcal: string;
	proteinG: string;
	warningCount: number;
	errorCount: number;
};

export function buildImportPreview(plan: PlanV2, issues: ValidationIssue[]): ImportPreview {
	const meta = (plan.meta ?? {}) as Record<string, unknown>;
	const user = (plan.user ?? {}) as Record<string, unknown>;
	const mp = (plan.meal_plan ?? {}) as Record<string, unknown>;
	const phases = Array.isArray(plan.phases) ? plan.phases : [];
	const p0 = (phases[0] ?? {}) as Record<string, unknown>;
	const tr = (plan.training ?? plan.training_program ?? {}) as Record<string, unknown>;
	const split = Array.isArray(tr.weekly_split) ? tr.weekly_split : [];

	const wkMeals = Array.isArray(mp.workout_day) ? mp.workout_day.length : 0;
	const rdMeals = Array.isArray(mp.rest_day) ? mp.rest_day.length : 0;

	const wkKcal = p0.kcal_workout_day ?? p0.kcal_daily;
	const protein = p0.protein_g;

	return {
		title: String(meta.title ?? meta.name ?? user.name ?? 'Health plan'),
		goal: String(user.primary_goal ?? user.goal ?? meta.goal ?? '—'),
		schemaVersion: String(meta.plan_schema_version ?? meta.schema_version ?? '—'),
		phaseCount: phases.length,
		workoutMeals: wkMeals,
		restMeals: rdMeals,
		trainingDays: split.length,
		workoutKcal: typeof wkKcal === 'number' ? `${wkKcal} kcal` : '—',
		proteinG: typeof protein === 'number' ? `${protein} g` : '—',
		warningCount: issues.filter((i) => i.level === 'warning').length,
		errorCount: issues.filter((i) => i.level === 'error').length
	};
}
