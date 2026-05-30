import type { PlanV2 } from '$lib/types/planV2';

export interface PhaseCardModel {
	index: number;
	idLabel: string;
	name: string;
	weeksLabel: string;
	kcalMain: string;
	kcalHint: string | null;
	macros: { label: string; value: string; kind: 'p' | 'c' | 'f' }[];
	description: string | null;
	keyFocus: string | null;
	flavourRotation: string | null;
	trainingNote: string | null;
}

function fmtNum(v: unknown): string | null {
	if (typeof v === 'number' && Number.isFinite(v)) return String(Math.round(v * 10) / 10);
	return null;
}

export function getPhaseCards(plan: PlanV2 | null): PhaseCardModel[] {
	const phases = plan?.phases;
	if (!Array.isArray(phases)) return [];

	return phases.map((raw, idx) => {
		const ph = (raw || {}) as Record<string, unknown>;
		const pid = ph.id != null ? String(ph.id) : String(idx + 1);
		const name = typeof ph.name === 'string' ? ph.name : 'Phase';

		let weeksLabel = '';
		if (typeof ph.weeks === 'string' && ph.weeks.trim()) weeksLabel = ph.weeks;
		else if (ph.week_start != null && ph.week_end != null) {
			weeksLabel = `Weeks ${ph.week_start}–${ph.week_end}`;
		}

		const kcalMainVal =
			ph.kcal_daily != null
				? ph.kcal_daily
				: ph.kcal_workout_day != null
					? ph.kcal_workout_day
					: null;
		const mainNum = fmtNum(kcalMainVal);
		const kcalMain = mainNum != null ? `${mainNum} kcal` : '— kcal';

		let kcalHint: string | null = null;
		if (ph.kcal_workout_day != null && ph.kcal_rest_day != null) {
			const w = fmtNum(ph.kcal_workout_day);
			const r = fmtNum(ph.kcal_rest_day);
			if (w && r) kcalHint = `Workout ${w} · Rest ${r}`;
		}

		const macros: PhaseCardModel['macros'] = [
			{ label: 'P', value: fmtNum(ph.protein_g) ? `${fmtNum(ph.protein_g)}g` : '—', kind: 'p' },
			{ label: 'C', value: fmtNum(ph.carbs_g) ? `${fmtNum(ph.carbs_g)}g` : '—', kind: 'c' },
			{ label: 'F', value: fmtNum(ph.fat_g) ? `${fmtNum(ph.fat_g)}g` : '—', kind: 'f' }
		];

		return {
			index: idx,
			idLabel: `Phase ${pid}`,
			name,
			weeksLabel,
			kcalMain,
			kcalHint,
			macros,
			description: typeof ph.description === 'string' ? ph.description : null,
			keyFocus: typeof ph.key_focus === 'string' ? ph.key_focus : null,
			flavourRotation: typeof ph.flavour_rotation === 'string' ? ph.flavour_rotation : null,
			trainingNote: typeof ph.training_note === 'string' ? ph.training_note : null
		};
	});
}
