import { consumedTotalsForDay } from '$lib/logic/dayTotals';
import { leastSquaresSlopePerDay } from '$lib/logic/linearRegression';
import { rollingLogicalDayKeys } from '$lib/logic/dateKey';
import { getMealsForDay, getPhaseIndex } from '$lib/logic/planDerive';
import { mealSlotKey } from '$lib/logic/mealSlots';
import type { DayType, PlanV2, ProgressV2 } from '$lib/types/planV2';

/** 0.8 g of protein per lb of bodyweight, expressed per kg. */
const PROTEIN_FLOOR_G_PER_KG = 1.7637;
const MIN_DAYS_LOGGED = 4;
const WEIGHT_TREND_WINDOW_DAYS = 14;
const MIN_WEIGH_INS_FOR_TREND = 5;

export type GapKind = 'protein_floor' | 'missed_meals' | 'calorie_target' | 'none';

export interface NutritionCoachResult {
	insufficientData: boolean;
	daysWithLogs: number;
	avgKcal: number | null;
	avgProtein: number | null;
	avgCarbs: number | null;
	avgFat: number | null;
	weightTrendKgPerWeek: number | null;
	proteinFloorGPerDay: number | null;
	daysUnderProteinFloor: number;
	missedPlannedMeals: string[];
	gap: GapKind;
	message: string;
}

function latestBodyweightKg(plan: PlanV2 | null, progress: ProgressV2): number | null {
	const entries = progress.weightEntries ?? [];
	if (entries.length > 0) {
		const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
		return sorted[sorted.length - 1].kg;
	}
	const u = plan?.user as Record<string, unknown> | undefined;
	const w = u?.weight_kg;
	return typeof w === 'number' && w > 0 ? w : null;
}

/**
 * Missed-meals check assumes yesterday used the given `dayType` — historical day type isn't
 * persisted, so this is an approximation using the day type currently selected in the UI.
 */
function missedMealsForDay(
	plan: PlanV2 | null,
	progress: ProgressV2,
	dayType: DayType,
	dayKey: string
): string[] {
	const meals = getMealsForDay(plan, dayType);
	const statuses = progress.mealSlotStatus ?? {};
	return meals
		.filter((m) => statuses[mealSlotKey(dayKey, dayType, m.slot)] !== 'logged')
		.map((m) => m.name);
}

/** Nutrition-coach analysis: 7-day macro average, protein floor, weight trend, and one gap to fix. */
export function analyzeNutrition(
	plan: PlanV2 | null,
	progress: ProgressV2,
	settings: Record<string, unknown>,
	activeDayType: DayType,
	now = new Date()
): NutritionCoachResult {
	const { keys } = rollingLogicalDayKeys(now, settings);
	const phaseIndex = getPhaseIndex(settings);
	const days = keys.map((k) => consumedTotalsForDay(plan, phaseIndex, progress, k));
	const logged = days.filter((d) => d.hasAnyLog);

	const bodyweight = latestBodyweightKg(plan, progress);
	const proteinFloor = bodyweight !== null ? bodyweight * PROTEIN_FLOOR_G_PER_KG : null;
	const daysUnderFloor =
		proteinFloor === null ? 0 : logged.filter((d) => d.protein < proteinFloor).length;

	const since = new Date(now.getTime() - WEIGHT_TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
	const weightEntries = (progress.weightEntries ?? []).filter((e) => {
		const t = Date.parse(e.date);
		return Number.isFinite(t) && t >= since.getTime();
	});
	const weightTrendKgPerWeek =
		weightEntries.length >= MIN_WEIGH_INS_FOR_TREND
			? (leastSquaresSlopePerDay(weightEntries.map((e) => ({ date: e.date, value: e.kg }))) ?? 0) *
				7
			: null;

	const yesterdayKey = keys[keys.length - 2];
	const missedPlannedMeals = yesterdayKey
		? missedMealsForDay(plan, progress, activeDayType, yesterdayKey)
		: [];

	if (logged.length < MIN_DAYS_LOGGED) {
		return {
			insufficientData: true,
			daysWithLogs: logged.length,
			avgKcal: null,
			avgProtein: null,
			avgCarbs: null,
			avgFat: null,
			weightTrendKgPerWeek,
			proteinFloorGPerDay: proteinFloor,
			daysUnderProteinFloor: daysUnderFloor,
			missedPlannedMeals,
			gap: 'none',
			message: `Only ${logged.length} of the last 7 days have logged food — log at least 4 before a nutrition read makes sense.`
		};
	}

	const avgKcal = logged.reduce((a, d) => a + d.kcal, 0) / logged.length;
	const avgProtein = logged.reduce((a, d) => a + d.protein, 0) / logged.length;
	const avgCarbs = logged.reduce((a, d) => a + d.carbs, 0) / logged.length;
	const avgFat = logged.reduce((a, d) => a + d.fat, 0) / logged.length;
	const avgKcalTarget = logged.reduce((a, d) => a + (d.targets.kcal || avgKcal), 0) / logged.length;
	const kcalGap = Math.abs(avgKcal - avgKcalTarget);

	let gap: GapKind = 'none';
	if (daysUnderFloor > 0) gap = 'protein_floor';
	else if (missedPlannedMeals.length > 0) gap = 'missed_meals';
	else if (kcalGap > 100) gap = 'calorie_target';

	const summary = `${Math.round(avgKcal)} cal avg / ${Math.round(avgProtein)}g P / ${Math.round(avgCarbs)}g C / ${Math.round(avgFat)}g F over ${logged.length} logged days.`;
	let change: string;
	if (gap === 'protein_floor') {
		const shortfall = Math.round((proteinFloor ?? 0) - avgProtein);
		change = `Protein under floor on ${daysUnderFloor} of ${logged.length} days. Add ~${Math.max(shortfall, 10)}g protein at your next meal.`;
	} else if (gap === 'missed_meals') {
		change = `Yesterday missed: ${missedPlannedMeals.slice(0, 2).join(', ')}. Log or replace it today.`;
	} else if (gap === 'calorie_target') {
		change =
			avgKcal > avgKcalTarget
				? `Averaging ${Math.round(kcalGap)} cal over target. Trim one thing tomorrow.`
				: `Averaging ${Math.round(kcalGap)} cal under target. Add one thing tomorrow.`;
	} else {
		change = 'On target. No change needed.';
	}

	return {
		insufficientData: false,
		daysWithLogs: logged.length,
		avgKcal,
		avgProtein,
		avgCarbs,
		avgFat,
		weightTrendKgPerWeek,
		proteinFloorGPerDay: proteinFloor,
		daysUnderProteinFloor: daysUnderFloor,
		missedPlannedMeals,
		gap,
		message: `${summary} ${change}`
	};
}
