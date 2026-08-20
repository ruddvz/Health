import { leastSquaresSlopePerDay } from '$lib/logic/linearRegression';
import { isCompoundPattern, patternLabel, type ExercisePattern } from '$lib/logic/exercisePattern';
import { e1rmPointsByPattern, lastSetRirForExercise } from '$lib/logic/workoutHistory';
import type { ProgressV2, WorkoutSessionLog } from '$lib/types/planV2';

const WINDOW_DAYS = 28;
const MIN_SESSIONS_IN_WINDOW = 3;
/** ~0.3 lb/week, converted to kg. */
const BODYWEIGHT_FALLING_THRESHOLD_KG_PER_WEEK = 0.136;
const FALLING_PCT_PER_WEEK = 2;

export type TrainingStatus = 'rising' | 'stalled' | 'falling' | 'food_problem';

export interface PatternInsight {
	pattern: ExercisePattern;
	patternLabel: string;
	exerciseName: string;
	sessionsInWindow: number;
	latestE1rmKg: number;
	e1rmDeltaVsWeekAgoKg: number | null;
	slopeKgPerWeek: number;
	status: TrainingStatus;
	lastRir: number | null;
	prescription: string;
}

export interface TrainingCoachResult {
	insights: PatternInsight[];
	ignoredPatterns: { pattern: ExercisePattern; sessionsInWindow: number }[];
	/** Set when no session has landed for longer than the median gap between sessions. */
	nudge: string | null;
}

function daysBetween(aIso: string, bIso: string): number {
	return Math.abs(Date.parse(aIso) - Date.parse(bIso)) / (24 * 60 * 60 * 1000);
}

function medianGapDays(sessionsOldestFirst: WorkoutSessionLog[]): number | null {
	if (sessionsOldestFirst.length < 2) return null;
	const gaps: number[] = [];
	for (let i = 1; i < sessionsOldestFirst.length; i++) {
		gaps.push(
			daysBetween(sessionsOldestFirst[i - 1].finishedAt, sessionsOldestFirst[i].finishedAt)
		);
	}
	gaps.sort((a, b) => a - b);
	const mid = Math.floor(gaps.length / 2);
	return gaps.length % 2 === 0 ? (gaps[mid - 1] + gaps[mid]) / 2 : gaps[mid];
}

function bodyweightSlopeKgPerWeek(progress: ProgressV2, since: Date, now: Date): number | null {
	const entries = (progress.weightEntries ?? []).filter((e) => {
		const t = Date.parse(e.date);
		return Number.isFinite(t) && t >= since.getTime() && t <= now.getTime();
	});
	if (entries.length < 2) return null;
	const perDay = leastSquaresSlopePerDay(entries.map((e) => ({ date: e.date, value: e.kg })));
	return perDay === null ? null : perDay * 7;
}

function prescriptionFor(
	status: TrainingStatus,
	isCompound: boolean,
	lastRir: number | null
): string {
	if (status === 'food_problem') {
		return 'Bodyweight is falling — this looks like a food problem, not a training problem. Check calories before changing this lift.';
	}
	if (status === 'stalled') {
		return 'Hold the load, add one rep to every set.';
	}
	if (status === 'falling') {
		return 'Drop the load 10% and repeat that load for two sessions.';
	}
	// rising
	if (lastRir !== null && lastRir >= 2) {
		return isCompound ? 'Add 2.5 kg (~5 lb) next session.' : 'Add 1.25 kg (~2.5 lb) next session.';
	}
	return 'Repeat last session exactly.';
}

/** Progressive-overload analysis over the last 28 days, one insight per movement pattern with 3+ sessions. */
export function analyzeTraining(progress: ProgressV2, now = new Date()): TrainingCoachResult {
	const sessionsOldestFirst = [...(progress.workoutSessions ?? [])].sort(
		(a, b) => Date.parse(a.finishedAt) - Date.parse(b.finishedAt)
	);

	if (sessionsOldestFirst.length === 0) {
		return { insights: [], ignoredPatterns: [], nudge: null };
	}

	const lastSession = sessionsOldestFirst[sessionsOldestFirst.length - 1];
	const gap = medianGapDays(sessionsOldestFirst);
	const daysSinceLast = daysBetween(lastSession.finishedAt, now.toISOString());
	let nudge: string | null = null;
	if (gap !== null && daysSinceLast > gap) {
		const whenLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
			new Date(lastSession.finishedAt)
		);
		nudge = `No session logged in ${Math.round(daysSinceLast)} days. Last one was ${whenLabel}.`;
	}

	const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
	const windowedSessions = sessionsOldestFirst.filter(
		(s) => Date.parse(s.finishedAt) >= since.getTime()
	);
	const byPattern = e1rmPointsByPattern(windowedSessions);

	const insights: PatternInsight[] = [];
	const ignoredPatterns: { pattern: ExercisePattern; sessionsInWindow: number }[] = [];
	const bwSlope = bodyweightSlopeKgPerWeek(progress, since, now);

	for (const [pattern, points] of byPattern) {
		if (points.length < MIN_SESSIONS_IN_WINDOW) {
			ignoredPatterns.push({ pattern, sessionsInWindow: points.length });
			continue;
		}
		const slopePerDay = leastSquaresSlopePerDay(
			points.map((p) => ({ date: p.date, value: p.e1rm }))
		);
		const slopeKgPerWeek = (slopePerDay ?? 0) * 7;
		const latest = points[points.length - 1];
		const weekAgoCutoff = Date.parse(latest.date) - 7 * 24 * 60 * 60 * 1000;
		const weekAgoPoint = [...points].reverse().find((p) => Date.parse(p.date) <= weekAgoCutoff);

		const weeklyPct = latest.e1rm > 0 ? (slopeKgPerWeek / latest.e1rm) * 100 : 0;
		let status: TrainingStatus;
		if (slopeKgPerWeek > 0) status = 'rising';
		else if (weeklyPct <= -FALLING_PCT_PER_WEEK) status = 'falling';
		else status = 'stalled';

		if (
			status !== 'rising' &&
			bwSlope !== null &&
			bwSlope < -BODYWEIGHT_FALLING_THRESHOLD_KG_PER_WEEK
		) {
			status = 'food_problem';
		}

		const lastRir = lastSetRirForExercise(lastSession, latest.exerciseName);

		insights.push({
			pattern,
			patternLabel: patternLabel(pattern),
			exerciseName: latest.exerciseName,
			sessionsInWindow: points.length,
			latestE1rmKg: Math.round(latest.e1rm * 10) / 10,
			e1rmDeltaVsWeekAgoKg: weekAgoPoint
				? Math.round((latest.e1rm - weekAgoPoint.e1rm) * 10) / 10
				: null,
			slopeKgPerWeek: Math.round(slopeKgPerWeek * 10) / 10,
			status,
			lastRir,
			prescription: prescriptionFor(status, isCompoundPattern(pattern), lastRir)
		});
	}

	insights.sort((a, b) => a.patternLabel.localeCompare(b.patternLabel));
	return { insights, ignoredPatterns, nudge };
}
