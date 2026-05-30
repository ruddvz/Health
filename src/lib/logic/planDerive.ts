import type { DayType, PlanV2 } from '$lib/types/planV2';

export function getUserName(plan: PlanV2 | null): string {
	const u = plan?.user as Record<string, unknown> | undefined;
	if (!u) return 'there';
	const n = u.name;
	return typeof n === 'string' && n.trim() ? n : 'there';
}

export function getPhaseLabel(plan: PlanV2 | null, index: number): string {
	const phases = plan?.phases;
	if (!Array.isArray(phases) || !phases[index]) return 'Phase';
	const p = phases[index] as Record<string, unknown>;
	const name = p.name;
	const weeks = p.weeks;
	if (typeof name === 'string')
		return typeof weeks === 'string' ? `${name} (${weeks})` : String(name);
	return `Phase ${index + 1}`;
}

export function getMealsForDay(plan: PlanV2 | null, day: DayType): MealRowDetail[] {
	const mp = plan?.meal_plan as Record<string, unknown> | undefined;
	if (!mp) return [];
	const key = day === 'workout' ? 'workout_day' : 'rest_day';
	const arr = mp[key];
	if (!Array.isArray(arr)) return [];
	return arr.map((m, i) => {
		const row = m as Record<string, unknown>;
		return {
			mealIndex: i,
			dayKey: key,
			slot: typeof row.slot === 'number' ? row.slot : i + 1,
			time: typeof row.time === 'string' ? row.time : '—',
			name: typeof row.name === 'string' ? row.name : 'Meal',
			kcal: typeof row.kcal === 'number' ? row.kcal : 0,
			protein: macroG(row, 'protein'),
			carbs: macroG(row, 'carbs'),
			fat: macroG(row, 'fat'),
			description: typeof row.description === 'string' ? row.description : undefined,
			prep_method: typeof row.prep_method === 'string' ? row.prep_method : undefined,
			prep_minutes: typeof row.prep_minutes === 'number' ? row.prep_minutes : undefined,
			ingredients: parseIngredients(row.ingredients),
			swaps: flattenMealSwaps(row)
		};
	});
}

export interface MealRow {
	slot: number;
	time: string;
	name: string;
	kcal: number;
	protein: string;
	carbs: string;
	fat: string;
}

export interface MealSwapLine {
	label: string;
	text: string;
}

export interface MealRowDetail extends MealRow {
	mealIndex: number;
	dayKey: 'workout_day' | 'rest_day';
	description?: string;
	prep_method?: string;
	prep_minutes?: number;
	ingredients?: { name: string; grams?: number }[];
	swaps: MealSwapLine[];
}

function parseIngredients(raw: unknown): { name: string; grams?: number }[] | undefined {
	if (!Array.isArray(raw)) return undefined;
	const out: { name: string; grams?: number }[] = [];
	for (const ing of raw) {
		const r = (ing || {}) as Record<string, unknown>;
		const name = typeof r.name === 'string' ? r.name : '';
		if (!name) continue;
		const grams = typeof r.grams === 'number' ? r.grams : undefined;
		out.push({ name, grams });
	}
	return out.length ? out : undefined;
}

export function flattenMealSwaps(meal: Record<string, unknown>): MealSwapLine[] {
	const sw = meal.swaps;
	if (!sw || typeof sw !== 'object') return [];
	const out: MealSwapLine[] = [];
	for (const [group, arr] of Object.entries(sw as Record<string, unknown>)) {
		if (!Array.isArray(arr)) continue;
		for (const item of arr) {
			const r = (item || {}) as Record<string, unknown>;
			const label = typeof r.label === 'string' ? r.label : group;
			const replace = typeof r.replace === 'string' ? r.replace : '';
			const withAlt = typeof r.with === 'string' ? r.with : '';
			const note = typeof r.note === 'string' ? r.note : '';
			const text = [replace && withAlt ? `${replace} → ${withAlt}` : replace || withAlt, note]
				.filter(Boolean)
				.join(' — ');
			if (text) out.push({ label, text });
		}
	}
	return out;
}

export function getEmergencyMeals(plan: PlanV2 | null, day: DayType): string[] {
	const mp = plan?.meal_plan as Record<string, unknown> | undefined;
	if (!mp) return [];
	const key =
		day === 'workout'
			? (mp.emergency_workout_meals ?? mp.emergency_meals ?? mp.bad_day_meals)
			: (mp.emergency_rest_meals ?? mp.emergency_meals ?? mp.bad_day_meals);
	if (!Array.isArray(key)) return [];
	return key
		.map((em) => {
			if (typeof em === 'string') return em;
			if (em && typeof em === 'object') {
				const r = em as Record<string, unknown>;
				const name = typeof r.name === 'string' ? r.name : '';
				const detail =
					typeof r.description === 'string'
						? r.description
						: typeof r.detail === 'string'
							? r.detail
							: '';
				return [name, detail].filter(Boolean).join(' — ');
			}
			return '';
		})
		.filter(Boolean);
}

export function getBudgetSwaps(
	plan: PlanV2 | null
): { premium: string; budget: string; note?: string }[] {
	const g = plan?.grocery as Record<string, unknown> | undefined;
	const swaps = g?.budget_swaps;
	if (!Array.isArray(swaps)) return [];
	const out: { premium: string; budget: string; note?: string }[] = [];
	for (const row of swaps) {
		const r = (row || {}) as Record<string, unknown>;
		const premium =
			typeof r.premium === 'string' ? r.premium : typeof r.item === 'string' ? r.item : '';
		const budget =
			typeof r.budget === 'string'
				? r.budget
				: typeof r.alternative === 'string'
					? r.alternative
					: '';
		const note = typeof r.note === 'string' ? r.note : undefined;
		if (!premium && !budget) continue;
		out.push({ premium, budget, note });
	}
	return out;
}

/** Litres per day from plan root or first phase; default 3 L. */
export function getWaterTargetLiters(plan: PlanV2 | null, phaseIndex = 0): number {
	const root = plan as Record<string, unknown> | null;
	const wl = root?.water_target_litres;
	if (typeof wl === 'number' && wl > 0) return wl;
	const phases = plan?.phases;
	if (Array.isArray(phases) && phases[phaseIndex]) {
		const p = phases[phaseIndex] as Record<string, unknown>;
		const pw = p.water_litres ?? p.water_target_litres;
		if (typeof pw === 'number' && pw > 0) return pw;
	}
	return 3;
}

export function getPhaseIndex(settings: Record<string, unknown>): number {
	const i = settings.phaseIndex;
	if (typeof i === 'number' && Number.isFinite(i) && i >= 0) return Math.floor(i);
	return 0;
}

function macroG(row: Record<string, unknown>, key: string): string {
	const ings = row.ingredients;
	if (!Array.isArray(ings)) return '—';
	/* v2 sample may omit per-meal macros — show dash */
	const direct = row[`${key}_g`];
	if (typeof direct === 'number') return `${direct}g`;
	return '—';
}

export function sumMealKcal(meals: MealRow[]): number {
	return meals.reduce((a, m) => a + (m.kcal || 0), 0);
}

export function getPhaseTargets(plan: PlanV2 | null, phaseIndex: number) {
	const phases = plan?.phases;
	if (!Array.isArray(phases) || !phases[phaseIndex]) {
		return { protein: 0, carbs: 0, fat: 0, kcal: 0 };
	}
	const p = phases[phaseIndex] as Record<string, unknown>;
	return {
		protein: num(p.protein_g),
		carbs: num(p.carbs_g),
		fat: num(p.fat_g),
		kcal: num(p.kcal_daily)
	};
}

function num(v: unknown): number {
	return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

export function getTrainingDay(plan: PlanV2 | null, dayIndex: number) {
	const t = plan?.training as Record<string, unknown> | undefined;
	const split = t?.weekly_split;
	if (!Array.isArray(split) || !split[dayIndex]) return null;
	return split[dayIndex] as Record<string, unknown>;
}

export function flattenGrocery(
	plan: PlanV2 | null
): { store: string; name: string; qty: string; key: string }[] {
	const g = plan?.grocery as Record<string, unknown> | undefined;
	if (!g) return [];
	const out: { store: string; name: string; qty: string; key: string }[] = [];
	for (const [cat, val] of Object.entries(g)) {
		if (!Array.isArray(val)) continue;
		for (const item of val) {
			if (!item || typeof item !== 'object') continue;
			const it = item as Record<string, unknown>;
			const name = typeof it.name === 'string' ? it.name : 'Item';
			const qty =
				typeof it.qty === 'string' ? it.qty : typeof it.quantity === 'string' ? it.quantity : '';
			const store = typeof it.store === 'string' ? it.store : categoryToStore(cat);
			out.push({ store, name, qty, key: `${cat}:${name}` });
		}
	}
	return out;
}

function categoryToStore(cat: string): string {
	const c = cat.toLowerCase();
	if (c === 'veg' || c === 'vegetables') return 'GREENGROCER';
	return 'SUPERMARKET';
}

export function getPrepSteps(
	plan: PlanV2 | null
): { title: string; subtitle: string; minutes: number; key: string }[] {
	const pg = plan?.prep_guide as Record<string, unknown> | undefined;
	const steps = pg?.sunday_steps;
	if (!Array.isArray(steps)) return [];
	return steps.map((s, i) => {
		const row = (s || {}) as Record<string, unknown>;
		const name = typeof row.name === 'string' ? row.name : `Step ${i + 1}`;
		const detail = typeof row.detail === 'string' ? row.detail : '';
		const minutes = typeof row.minutes === 'number' ? row.minutes : 0;
		const key = `prep:${i}`;
		return { title: name, subtitle: detail, minutes, key };
	});
}

export function getSupplementSchedule(
	plan: PlanV2 | null
): { time: string; title: string; subtitle: string; key: string }[] {
	const sup = plan?.supplements as Record<string, unknown> | undefined;
	const sched = sup?.daily_schedule;
	if (!Array.isArray(sched)) return [];
	return sched.map((row, i) => {
		const r = (row || {}) as Record<string, unknown>;
		const label = typeof r.label === 'string' ? r.label : `Slot ${i + 1}`;
		const items = typeof r.items === 'string' ? r.items : '';
		const note = typeof r.note === 'string' ? r.note : '';
		return {
			time: labelToTime(label),
			title: items || 'Supplement',
			subtitle: note || 'Follow label directions.',
			key: `supp:${i}`
		};
	});
}

function labelToTime(label: string): string {
	const l = label.toLowerCase();
	if (l.includes('morning')) return '08:00';
	if (l.includes('afternoon')) return '12:00';
	if (l.includes('evening')) return '17:00';
	if (l.includes('night') || l.includes('bed')) return '21:30';
	return '—';
}

export function greeting(): string {
	const h = new Date().getHours();
	if (h < 12) return 'Good morning';
	if (h < 17) return 'Good afternoon';
	return 'Good evening';
}

/** Converts `HH:mm` (onboarding / plan) to a localized 12h label (e.g. 10:00 PM). */
export function formatTimeFromHHMM(hhmm: string | undefined | null): string | null {
	if (!hhmm || typeof hhmm !== 'string') return null;
	const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
	if (!m) return null;
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	const d = new Date();
	d.setHours(h, min, 0, 0);
	return new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(d);
}
