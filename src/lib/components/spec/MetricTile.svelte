<script lang="ts">
	interface Props {
		label: string;
		value: string;
		subvalue: string;
		progress: number;
		tone?: 'default' | 'warning' | 'danger';
	}
	let { label, value, subvalue, progress, tone = 'default' }: Props = $props();
	const pct = $derived(Math.round(Math.min(1, Math.max(0, progress)) * 100));
</script>

<div class="tile card" data-tone={tone}>
	<p class="lab">{label}</p>
	<p class="val">{value}</p>
	<p class="sub">{subvalue}</p>
	<div class="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
		<div class="fill" style:width={`${pct}%`}></div>
	</div>
</div>

<style>
	.tile {
		padding: 14px;
		min-height: 112px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.lab {
		margin: 0;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--h-text-muted);
	}

	.val {
		margin: 0;
		font-size: clamp(28px, 6vw, 34px);
		font-weight: 760;
		line-height: var(--lh-tight);
		color: var(--h-text);
	}

	.sub {
		margin: 0;
		font-size: var(--t-footnote);
		color: var(--h-text-soft);
	}

	.bar {
		margin-top: auto;
		height: 4px;
		background: var(--h-line-soft);
		border-radius: var(--r-pill);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: var(--h-accent);
		border-radius: var(--r-pill);
	}

	.tile[data-tone='warning'] .fill {
		background: var(--h-orange);
	}

	.tile[data-tone='danger'] .fill {
		background: var(--h-red);
	}
</style>
