import { classifyExercisePattern, type ExercisePattern } from '$lib/logic/exercisePattern';
import { e1rmFromSet } from '$lib/logic/e1rm';
import type { WorkoutSessionLog } from '$lib/types/planV2';

function parseKg(s: string | undefined): number | null {
	if (s === undefined) return null;
	const v = Number(String(s).replace(',', '.').trim());
	return Number.isFinite(v) ? v : null;
}

function parseRir(s: string | undefined): number | null {
	if (s === undefined || s.trim() === '') return null;
	const v = Number(String(s).replace(',', '.').trim());
	return Number.isFinite(v) ? v : null;
}

export function recentSessions(
	progress: { workoutSessions?: WorkoutSessionLog[] },
	limit = 5
): WorkoutSessionLog[] {
	const all = [...(progress.workoutSessions ?? [])];
	return all.slice(-limit).reverse();
}

export interface LiftStat {
	name: string;
	lastKg: number | null;
	bestKg: number | null;
}

/** Best logged weight per exercise, and most recent logged weight (sessions newest-first). */
export function liftStatsFromSessions(sessionsNewestFirst: WorkoutSessionLog[]): LiftStat[] {
	const last = new Map<string, number>();
	const best = new Map<string, number>();
	for (const s of sessionsNewestFirst) {
		for (const ex of s.exercises) {
			const name = ex.name;
			for (const st of ex.sets) {
				const w = parseKg(st.weight_kg);
				if (w === null) continue;
				if (!last.has(name)) last.set(name, w);
				best.set(name, Math.max(best.get(name) ?? 0, w));
			}
		}
	}
	const names = [...new Set([...last.keys(), ...best.keys()])].sort((a, b) => a.localeCompare(b));
	return names.map((name) => ({
		name,
		lastKg: last.get(name) ?? null,
		bestKg: best.has(name) ? (best.get(name) as number) : null
	}));
}

export interface PatternSessionPoint {
	date: string;
	e1rm: number;
	exerciseName: string;
}

/** Best e1RM per session date, grouped by movement pattern (sessions oldest→newest per pattern). */
export function e1rmPointsByPattern(
	sessionsOldestFirst: WorkoutSessionLog[]
): Map<ExercisePattern, PatternSessionPoint[]> {
	const byPattern = new Map<ExercisePattern, PatternSessionPoint[]>();
	for (const s of sessionsOldestFirst) {
		const bestForPattern = new Map<ExercisePattern, PatternSessionPoint>();
		for (const ex of s.exercises) {
			const pattern = classifyExercisePattern(ex.name);
			for (const st of ex.sets) {
				const e1rm = e1rmFromSet(st.weight_kg, st.reps);
				if (e1rm === null) continue;
				const cur = bestForPattern.get(pattern);
				if (!cur || e1rm > cur.e1rm) {
					bestForPattern.set(pattern, { date: s.finishedAt, e1rm, exerciseName: ex.name });
				}
			}
		}
		for (const [pattern, point] of bestForPattern) {
			const arr = byPattern.get(pattern) ?? [];
			arr.push(point);
			byPattern.set(pattern, arr);
		}
	}
	return byPattern;
}

/** RIR of the last completed set logged for the given exercise name in this session, if any. */
export function lastSetRirForExercise(
	session: WorkoutSessionLog,
	exerciseName: string
): number | null {
	const ex = session.exercises.find((e) => e.name === exerciseName);
	if (!ex || ex.sets.length === 0) return null;
	for (let i = ex.sets.length - 1; i >= 0; i--) {
		const r = parseRir(ex.sets[i].rir);
		if (r !== null) return r;
	}
	return null;
}
