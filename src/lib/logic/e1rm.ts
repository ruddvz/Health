/** Epley-formula estimated one-rep max. Reps must be whole and >0; a single true 1RM set returns the weight itself. */
export function calcE1RM(weightKg: number, reps: number): number | null {
	if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
	if (!Number.isFinite(reps) || reps <= 0) return null;
	return weightKg * (1 + reps / 30);
}

function parseNum(s: string | undefined): number | null {
	if (s === undefined) return null;
	const v = Number(String(s).replace(',', '.').trim());
	return Number.isFinite(v) ? v : null;
}

/** Parses `weight_kg`/`reps` strings and returns the estimated 1RM, or null if either is missing/invalid. */
export function e1rmFromSet(weightKg: string | undefined, reps: string | undefined): number | null {
	const w = parseNum(weightKg);
	const r = parseNum(reps);
	if (w === null || r === null) return null;
	return calcE1RM(w, r);
}
