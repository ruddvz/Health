import type { PlanV2 } from '$lib/types/planV2';
import {
	errorIssue,
	firstErrorMessage,
	type ValidationIssue,
	warningIssue,
	warningMessages
} from './issues';

const REQUIRED_TOP = [
	'meta',
	'user',
	'phases',
	'meal_plan',
	'prep_guide',
	'grocery',
	'supplements'
] as const;

const KCAL_MIN = 600;
const KCAL_MAX = 8000;

export type { ValidationIssue, ValidationLevel } from './issues';
export { issuesToMessages, warningMessages, firstErrorMessage } from './issues';

export type ParsePlanResult =
	| { ok: true; plan: PlanV2; issues: ValidationIssue[]; warnings: string[] }
	| { ok: false; issues: ValidationIssue[]; error: string; warnings: string[] };

/** Trim BOM, optional ```json fences, and outer whitespace from pasted / exported text. */
export function normalizeImportedPlanJsonText(text: string): string {
	let s = text.trim();
	if (s.charCodeAt(0) === 0xfeff) s = s.slice(1).trim();
	const open = s.match(/^```(?:json)?\s*\r?\n?/i);
	if (open) {
		s = s.slice(open[0].length);
		const close = s.lastIndexOf('```');
		if (close !== -1) s = s.slice(0, close);
		s = s.trim();
	}
	return s;
}

export function parsePlanJsonText(text: string): ParsePlanResult {
	let data: unknown;
	try {
		data = JSON.parse(normalizeImportedPlanJsonText(text));
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Invalid JSON';
		const issues = [
			errorIssue(
				'JSON_PARSE',
				'$',
				`JSON parse error: ${msg}`,
				'Check for trailing commas or quotes.'
			)
		];
		return { ok: false, issues, error: issues[0].message, warnings: [] };
	}
	return validatePlanUnknown(data);
}

export function validatePlanUnknown(data: unknown): ParsePlanResult {
	const issues: ValidationIssue[] = [];

	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		const err = errorIssue('NOT_OBJECT', '$', 'Plan must be a JSON object.');
		return fail([err]);
	}

	const o = data as Record<string, unknown>;

	for (const key of REQUIRED_TOP) {
		if (!(key in o) || o[key] == null) {
			issues.push(
				errorIssue(
					'MISSING_SECTION',
					key,
					`Missing required section: "${key}"`,
					'Add this top-level key or migrate from an older schema.'
				)
			);
		}
	}
	if (issues.length) return fail(issues);

	if (!Array.isArray(o.phases)) {
		issues.push(errorIssue('INVALID_PHASES', 'phases', '"phases" must be an array.'));
		return fail(issues);
	}

	if (!o.meal_plan || typeof o.meal_plan !== 'object' || Array.isArray(o.meal_plan)) {
		issues.push(errorIssue('INVALID_MEAL_PLAN', 'meal_plan', '"meal_plan" must be an object.'));
		return fail(issues);
	}

	issues.push(...runStructuralChecks(o));
	issues.push(...runCoreWarnings(o));
	issues.push(...runSafetyWarnings(o));

	const blocking = issues.filter((i) => i.level === 'error');
	if (blocking.length) return fail(issues);

	const warnings = warningMessages(issues);
	return { ok: true, plan: o as PlanV2, issues, warnings };
}

function fail(issues: ValidationIssue[]): ParsePlanResult {
	return {
		ok: false,
		issues,
		error: firstErrorMessage(issues) ?? 'Plan validation failed.',
		warnings: warningMessages(issues)
	};
}

function runStructuralChecks(o: Record<string, unknown>): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const phases = o.phases as unknown[];
	const mealPlan = o.meal_plan as Record<string, unknown>;

	const seenIds = new Set<string>();
	phases.forEach((raw, idx) => {
		const ph = (raw || {}) as Record<string, unknown>;
		const id = ph.id != null ? String(ph.id) : String(idx + 1);
		if (seenIds.has(id)) {
			issues.push(
				errorIssue(
					'DUPLICATE_PHASE_ID',
					`phases[${idx}].id`,
					`Duplicate phase id "${id}".`,
					'Give each phase a unique id.'
				)
			);
		}
		seenIds.add(id);

		const wk = num(ph.kcal_workout_day ?? ph.kcal_daily);
		const rd = num(ph.kcal_rest_day ?? ph.kcal_daily);
		for (const [label, kcal] of [
			['workout', wk],
			['rest', rd]
		] as const) {
			if (kcal == null) continue;
			if (kcal < KCAL_MIN || kcal > KCAL_MAX) {
				issues.push(
					errorIssue(
						'UNSAFE_CALORIES',
						`phases[${idx}]`,
						`Phase ${id} ${label}-day calories (${kcal}) are outside a typical planning range (${KCAL_MIN}–${KCAL_MAX} kcal).`,
						'Review targets with a qualified professional.'
					)
				);
			}
		}
	});

	for (const key of ['workout_day', 'rest_day'] as const) {
		const meals = mealPlan[key];
		if (!Array.isArray(meals)) {
			issues.push(
				warningIssue(
					'EMPTY_MEALS',
					`meal_plan.${key}`,
					`meal_plan.${key} is missing or not an array.`,
					'Add meal slots for this day type.'
				)
			);
		} else if (meals.length === 0) {
			issues.push(
				warningIssue('EMPTY_MEALS', `meal_plan.${key}`, `meal_plan.${key} has no meals.`)
			);
		}
	}

	const user = o.user as Record<string, unknown> | undefined;
	if (user && typeof user === 'object') {
		const h = num(user.height_cm);
		if (h != null && (h < 120 || h > 250)) {
			issues.push(
				warningIssue(
					'UNUSUAL_HEIGHT',
					'user.height_cm',
					`Height (${h} cm) looks unusual — confirm units.`,
					'Use centimeters or feet/inches consistently.'
				)
			);
		}
		const w = num(user.weight_kg);
		if (w != null && (w < 30 || w > 300)) {
			issues.push(
				warningIssue(
					'UNUSUAL_WEIGHT',
					'user.weight_kg',
					`Weight (${w} kg) looks unusual — confirm units.`,
					'Use kilograms or pounds consistently.'
				)
			);
		}
	}

	return issues;
}

function runCoreWarnings(o: Record<string, unknown>): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const phases = o.phases;
	const meal_plan = o.meal_plan as Record<string, unknown> | undefined;
	const training = o.training as Record<string, unknown> | undefined;

	if (Array.isArray(phases) && phases.length && meal_plan) {
		const wd = meal_plan.workout_day;
		if (Array.isArray(wd)) {
			let sum = 0;
			for (const m of wd) {
				if (
					m &&
					typeof m === 'object' &&
					'kcal' in m &&
					typeof (m as { kcal: unknown }).kcal === 'number'
				) {
					sum += (m as { kcal: number }).kcal;
				}
			}
			const p0 = phases[0] as Record<string, unknown>;
			const target = num(p0?.kcal_daily);
			if (target != null && sum > 0 && Math.abs(sum - target) > 100) {
				issues.push(
					warningIssue(
						'MEAL_KCAL_GAP',
						'meal_plan.workout_day',
						'Meal calories differ from phase target by more than 100 kcal (workout day sum vs phase kcal).',
						'Adjust meals or phase targets in Meals / macro repair.'
					)
				);
			}
		}
	}

	if (training && typeof training === 'object') {
		const split = training.weekly_split;
		if (!Array.isArray(split) || split.length === 0) {
			issues.push(
				warningIssue(
					'MISSING_WEEKLY_SPLIT',
					'training.weekly_split',
					'Training notes may exist but weekly_split is empty or missing.',
					'Add training.weekly_split for the Train tab.'
				)
			);
		}
		const injuries = String(training.injuries ?? training.injury_notes ?? '').trim();
		if (injuries.length > 0 && (!Array.isArray(split) || split.length === 0)) {
			issues.push(
				warningIssue(
					'INJURY_NO_PROGRAM',
					'training',
					'Injury notes are present but no structured weekly_split program was found.',
					'Consider modifications in your training JSON.'
				)
			);
		}
	}

	const sup = o.supplements as Record<string, unknown> | undefined;
	if (sup && typeof sup === 'object') {
		const stack = sup.stack;
		if (Array.isArray(stack) && stack.length > 0) {
			const hasNote = stack.some((item) => {
				if (!item || typeof item !== 'object') return true;
				const it = item as Record<string, unknown>;
				return typeof it.safety_note === 'string' || typeof it.note === 'string';
			});
			if (!hasNote) {
				issues.push(
					warningIssue(
						'SUPPLEMENT_SAFETY_NOTES',
						'supplements.stack',
						'Supplement stack entries may be missing explicit safety / evidence notes.',
						'Add safety_note fields — supplements are not medical advice.'
					)
				);
			}
		}
	}

	const schedule = o.schedule as Record<string, unknown> | undefined;
	if (schedule && meal_plan) {
		issues.push(...mealScheduleWarnings(schedule, meal_plan));
	}

	return issues;
}

function runSafetyWarnings(o: Record<string, unknown>): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const user = o.user as Record<string, unknown> | undefined;
	const safety = o.safety as Record<string, unknown> | undefined;
	const sup = o.supplements as Record<string, unknown> | undefined;

	const allergies = String(user?.allergies ?? safety?.allergies ?? '').trim();
	if (!allergies) {
		issues.push(
			warningIssue(
				'MISSING_ALLERGIES',
				'user.allergies',
				'No allergies field found — consider documenting known allergies.',
				'Add user.allergies or safety.allergies in your plan JSON.'
			)
		);
	}

	const onMeds =
		user?.medication_warning === true ||
		safety?.medication_warning === true ||
		String(user?.medications ?? '').trim().length > 0;

	const stack = sup?.stack;
	if (onMeds && Array.isArray(stack) && stack.length > 0) {
		issues.push(
			warningIssue(
				'MEDS_AND_SUPPLEMENTS',
				'supplements',
				'Medication flag is set and supplements are listed — review interactions with a clinician.',
				'Do not treat supplement timing as medical guidance.'
			)
		);
	}

	const wl = num((o as Record<string, unknown>).water_target_litres);
	if (wl != null && wl > 4) {
		issues.push(
			warningIssue(
				'HIGH_WATER',
				'water_target_litres',
				'Water target is above 4 L/day — confirm this fits your clinician’s advice and climate.'
			)
		);
	}

	if (user && typeof user === 'object') {
		const age = num(user.age);
		if (age != null && age < 18) {
			issues.push(
				warningIssue(
					'UNDER_18',
					'user.age',
					'Plan user age is under 18 — consider professional supervision for nutrition and training.'
				)
			);
		}
		const pregnant =
			user.pregnant === true ||
			safety?.pregnant === true ||
			String(user.pregnancy ?? '')
				.toLowerCase()
				.includes('yes');
		if (pregnant) {
			issues.push(
				warningIssue(
					'PREGNANCY',
					'user',
					'Pregnancy noted — review calories, supplements, and training with a qualified professional.'
				)
			);
		}
	}

	const phases = o.phases;
	if (Array.isArray(phases)) {
		for (let i = 0; i < phases.length; i++) {
			const ph = (phases[i] || {}) as Record<string, unknown>;
			const pace = String(ph.pace ?? ph.urgency ?? '').toLowerCase();
			if (pace.includes('aggressive') || pace.includes('rapid')) {
				issues.push(
					warningIssue(
						'AGGRESSIVE_PACE',
						`phases[${i}]`,
						`Phase ${ph.id ?? i + 1} pace looks aggressive — consider a sustainable timeline.`
					)
				);
			}
		}
	}

	if (sup && !o.safety && !(sup.safety && typeof sup.safety === 'object')) {
		issues.push(
			warningIssue(
				'NO_SAFETY_BLOCK',
				'safety',
				'Supplement section has no explicit safety block — treat claims as general wellness, not medical facts.'
			)
		);
	}

	return issues;
}

function mealScheduleWarnings(
	schedule: Record<string, unknown>,
	mealPlan: Record<string, unknown>
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const wake = parseHHMM(schedule.wake_time ?? schedule.wake);
	const sleep = parseHHMM(schedule.sleep_time ?? schedule.sleep);
	if (wake == null || sleep == null) return issues;

	const allMeals: { path: string; time: string }[] = [];
	for (const key of ['workout_day', 'rest_day'] as const) {
		const arr = mealPlan[key];
		if (!Array.isArray(arr)) continue;
		arr.forEach((m, i) => {
			if (m && typeof m === 'object' && 'time' in m) {
				const t = String((m as { time: unknown }).time ?? '').trim();
				if (t) allMeals.push({ path: `meal_plan.${key}[${i}].time`, time: t });
			}
		});
	}

	for (const { path, time } of allMeals) {
		const mins = parseHHMM(time);
		if (mins == null) continue;
		if (mins < wake || mins > sleep) {
			issues.push(
				warningIssue(
					'MEAL_OUTSIDE_SCHEDULE',
					path,
					`Meal at ${time} is outside wake (${formatMins(wake)}) and sleep (${formatMins(sleep)}) window.`,
					'Adjust meal times or schedule in your plan JSON.'
				)
			);
		}
	}
	return issues;
}

function num(v: unknown): number | null {
	return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function parseHHMM(s: unknown): number | null {
	if (typeof s !== 'string' && typeof s !== 'number') return null;
	const str = String(s).trim();
	const m = str.match(/^(\d{1,2}):(\d{2})/);
	if (!m) return null;
	return Number(m[1]) * 60 + Number(m[2]);
}

function formatMins(mins: number): string {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return `${h}:${String(m).padStart(2, '0')}`;
}
