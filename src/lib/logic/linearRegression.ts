export interface RegressionPoint {
	x: number;
	y: number;
}

/** Least-squares slope (dy/dx) through the points, or null with fewer than 2. Flat/vertical data returns 0. */
export function leastSquaresSlope(points: RegressionPoint[]): number | null {
	const n = points.length;
	if (n < 2) return null;
	const meanX = points.reduce((a, p) => a + p.x, 0) / n;
	const meanY = points.reduce((a, p) => a + p.y, 0) / n;
	let num = 0;
	let den = 0;
	for (const p of points) {
		num += (p.x - meanX) * (p.y - meanY);
		den += (p.x - meanX) ** 2;
	}
	if (den === 0) return 0;
	return num / den;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fits `value` against days-since-epoch for ISO/date-key timestamps, returning slope per day. */
export function leastSquaresSlopePerDay(entries: { date: string; value: number }[]): number | null {
	const points: RegressionPoint[] = [];
	for (const e of entries) {
		const t = Date.parse(e.date);
		if (!Number.isFinite(t) || !Number.isFinite(e.value)) continue;
		points.push({ x: t / MS_PER_DAY, y: e.value });
	}
	return leastSquaresSlope(points);
}
