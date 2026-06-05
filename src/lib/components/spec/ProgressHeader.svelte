<script lang="ts">
	interface Props {
		label: string;
		progress: number;
	}
	let { label, progress }: Props = $props();
	const pct = $derived(Math.round(Math.min(1, Math.max(0, progress)) * 100));
</script>

<div class="wrap">
	<p class="lab">{label}</p>
	<div class="track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
		<div class="fill" style:width={`${pct}%`}></div>
	</div>
	<p class="pct" aria-hidden="true">{pct}%</p>
</div>

<style>
	.wrap {
		margin-bottom: var(--s-4);
		padding: var(--s-4);
		border-radius: var(--r-card);
		background: linear-gradient(180deg, var(--h-surface), var(--h-surface-2));
		border: 1px solid var(--h-line);
		box-shadow: var(--shadow-card-soft);
	}

	.lab {
		margin: 0 0 var(--s-2);
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.track {
		height: 8px;
		border-radius: var(--r-pill);
		background: var(--h-accent-soft);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: var(--r-pill);
		background: var(--h-accent);
		box-shadow: var(--shadow-glow);
		transition: width var(--dur-slow) var(--ease-out);
	}

	.pct {
		margin: var(--s-2) 0 0;
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		color: var(--h-accent);
	}
</style>
