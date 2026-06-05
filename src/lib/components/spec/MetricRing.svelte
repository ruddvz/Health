<script lang="ts">
	interface Props {
		value: number;
		max: number;
		unit: string;
		label: string;
		tone?: 'default' | 'warning' | 'danger';
	}
	let { value, max, unit, label, tone = 'default' }: Props = $props();
	const pct = $derived(max <= 0 ? 0 : Math.min(1, value / max));
	const size = 78;
	const stroke = 8;
	const r = (size - stroke) / 2;
	const c = size / 2;
	const circ = 2 * Math.PI * r;
	const dash = $derived(circ * (1 - pct));
</script>

<div class="wrap" data-tone={tone} role="img" aria-label={`${label}: ${value} ${unit} of ${max}`}>
	<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
		<circle class="track" cx={c} cy={c} {r} fill="none" stroke-width={stroke} />
		<circle
			class="prog"
			cx={c}
			cy={c}
			{r}
			fill="none"
			stroke-width={stroke}
			stroke-dasharray={`${circ} ${circ}`}
			stroke-dashoffset={dash}
			transform={`rotate(-90 ${c} ${c})`}
		/>
	</svg>
	<div class="center">
		<span class="val">{value}{unit}</span>
		<span class="sub">{label}</span>
	</div>
</div>

<style>
	.wrap {
		position: relative;
		width: 78px;
		height: 78px;
		flex-shrink: 0;
	}

	.track {
		stroke: var(--h-line-soft);
	}

	.prog {
		stroke: var(--h-accent);
		stroke-linecap: round;
		transition: stroke-dashoffset var(--dur-slow) var(--ease-standard);
	}

	.wrap[data-tone='warning'] .prog {
		stroke: var(--h-orange);
	}

	.wrap[data-tone='danger'] .prog {
		stroke: var(--h-red);
	}

	@media (prefers-reduced-motion: reduce) {
		.prog {
			transition: none;
		}
	}

	.center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding-top: 2px;
	}

	.val {
		font-size: 20px;
		font-weight: 760;
		color: var(--h-text);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.sub {
		margin-top: 2px;
		font-size: var(--t-caption-2);
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--h-text-muted);
		max-width: 72px;
		line-height: 1.2;
	}
</style>
