import type { PlanV2 } from '$lib/types/planV2';
import { validatePlanUnknown } from '$lib/validation/planV2';

function num(v: unknown): number | null {
	return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Runtime plan consistency checks (legacy parity + import heuristics). */
export function collectPlanWarnings(plan: PlanV2 | null): string[] {
	if (!plan) return [];

	const warnings: string[] = [];
	const validated = validatePlanUnknown(plan);
	if (validated.warnings.length) warnings.push(...validated.warnings);

	const phases = plan.phases;
	const mp = plan.meal_plan as Record<string, unknown> | undefined;
	if (!Array.isArray(phases) || !phases.length || !mp || typeof mp !== 'object') {
		return dedupe(warnings);
	}

	const dt = mp.daily_totals as Record<string, unknown> | undefined;
	if (dt && typeof dt === 'object') {
		const wkT = num(dt.workout_day_kcal);
		const rdT = num(dt.rest_day_kcal);
		const wkP = num(dt.workout_day_protein_g);
		const rdP = num(dt.rest_day_protein_g);

		phases.forEach((raw, idx) => {
			const ph = (raw || {}) as Record<string, unknown>;
			const pid = ph.id != null ? String(ph.id) : String(idx + 1);
			const wk = num(ph.kcal_workout_day != null ? ph.kcal_workout_day : ph.kcal_daily);
			const rd = num(ph.kcal_rest_day != null ? ph.kcal_rest_day : ph.kcal_daily);
			const tg = num(ph.protein_g);

			if (wk != null && wkT != null && Math.abs(wk - wkT) > 100) {
				warnings.push(
					`Phase ${pid}: logged workout-day meals total ${wkT} kcal vs phase target ~${wk} kcal (over 100 kcal apart).`
				);
			}
			if (rd != null && rdT != null && Math.abs(rd - rdT) > 100) {
				warnings.push(
					`Phase ${pid}: logged rest-day meals total ${rdT} kcal vs phase target ~${rd} kcal (over 100 kcal apart).`
				);
			}
			if (tg != null && wkP != null && tg - wkP > 15) {
				warnings.push(
					`Phase ${pid}: workout-day protein in meals (${wkP} g) is more than 15 g below phase target (${tg} g).`
				);
			}
			if (tg != null && rdP != null && tg - rdP > 15) {
				warnings.push(
					`Phase ${pid}: rest-day protein in meals (${rdP} g) is more than 15 g below phase target (${tg} g).`
				);
			}
		});
	}

	const tr = (plan.training ?? plan.training_program) as Record<string, unknown> | undefined;
	const hasProgram = tr && Array.isArray(tr.weekly_split) && tr.weekly_split.length > 0;
	if (
		!hasProgram &&
		phases.some((p) => {
			const ph = (p || {}) as Record<string, unknown>;
			return String(ph.training_note ?? '').trim().length > 0;
		})
	) {
		warnings.push(
			'This plan includes training notes but no structured weekly_split program in JSON.'
		);
	}

	const wl = num((plan as Record<string, unknown>).water_target_litres);
	if (wl != null && wl > 4) {
		warnings.push(
			'Water target is above 4 L/day — confirm this fits your clinician’s advice and climate.'
		);
	}

	const sup = plan.supplements as Record<string, unknown> | undefined;
	const planRec = plan as Record<string, unknown>;
	if (
		sup &&
		typeof sup === 'object' &&
		!planRec.safety &&
		!(sup.safety && typeof sup.safety === 'object')
	) {
		warnings.push(
			'Supplement section has no explicit safety block — treat claims as general wellness, not medical facts.'
		);
	}

	return dedupe(warnings);
}

function dedupe(items: string[]): string[] {
	return [...new Set(items.filter((s) => s.trim().length > 0))];
}
