<script lang="ts">
	interface Props {
		title: string;
		value: string;
		delta: string;
		labels: string[];
		/** Normalized 0–1 heights for sparkline (same length as labels). */
		series?: number[];
	}
	let { title, value, delta, labels, series }: Props = $props();

	const gridLines = $derived.by(() => {
		const out: number[] = [];
		for (let i = 0; i < labels.length; i++) out.push(i);
		return out;
	});

	const pts = $derived.by(() => {
		const n = Math.max(1, labels.length);
		const base =
			series && series.length === labels.length ? series : Array.from({ length: n }, () => 0.45);
		return base.map((t) => 8 + (1 - Math.min(1, Math.max(0, t))) * 52);
	});

	const polyPoints = $derived.by(() => {
		if (pts.length < 2) {
			const y = pts[0] ?? 36;
			return `10,${y} 310,${y}`;
		}
		return pts.map((y, i) => `${(i / (pts.length - 1)) * 300 + 10},${y}`).join(' ');
	});
</script>

<section class="card nothing-surface" aria-label={title}>
	<p class="t">{title}</p>
	<p class="val">{value}</p>
	<p class="d">{delta}</p>
	<div class="chart" role="img" aria-label="Trend sparkline">
		<svg width="100%" height="72" viewBox="0 0 320 72" preserveAspectRatio="none">
			{#each gridLines as i (i)}
				<line
					x1={(i / Math.max(1, labels.length - 1)) * 300 + 10}
					y1="8"
					x2={(i / Math.max(1, labels.length - 1)) * 300 + 10}
					y2="64"
					stroke="var(--h-line-soft)"
					stroke-width="1"
				/>
			{/each}
			<polyline fill="none" stroke="var(--h-accent)" stroke-width="2.5" points={polyPoints} />
		</svg>
		<div class="labs">
			{#each labels as lb, li (`${lb}-${li}`)}
				<span>{lb}</span>
			{/each}
		</div>
	</div>
</section>

<style>
	.card {
		padding: var(--s-4);
		margin-bottom: var(--s-3);
	}

	.t {
		margin: 0;
		color: var(--h-text-faint);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
	}

	.val {
		margin: var(--s-2) 0 0;
		font-size: var(--t-title-2);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.d {
		margin: var(--s-1) 0 var(--s-3);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.chart {
		border-radius: var(--r-card-inner);
		background: var(--h-surface-3);
		border: 1px solid var(--h-line-soft);
		overflow: hidden;
	}

	.labs {
		display: flex;
		justify-content: space-between;
		padding: 0 var(--s-2) var(--s-2);
		gap: var(--s-1);
	}

	.labs span {
		flex: 1;
		text-align: center;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}
</style>
