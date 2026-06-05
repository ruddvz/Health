<script lang="ts">
	interface Props {
		title: string;
		value: string;
		subtitle: string;
		bars: number[];
	}
	let { title, value, subtitle, bars }: Props = $props();
</script>

<section class="card nothing-surface" aria-label={title}>
	<div class="head">
		<div>
			<p class="t">{title}</p>
			<p class="val">{value}</p>
			<p class="sub">{subtitle}</p>
		</div>
	</div>
	<div class="bars" role="img" aria-label={`${title} ${value} ${subtitle}`}>
		{#each bars as h, i (i)}
			<div class="bwrap">
				<div class="b" style:height={`${Math.round(h * 100)}%`}></div>
			</div>
		{/each}
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

	.sub {
		margin: var(--s-1) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.bars {
		display: flex;
		align-items: flex-end;
		gap: var(--s-2);
		height: 88px;
		margin-top: var(--s-3);
		padding-top: var(--s-2);
		border-top: 1px solid var(--h-line-soft);
	}

	.bwrap {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}

	.b {
		width: 100%;
		min-height: 4px;
		border-radius: var(--r-xxs) var(--r-xxs) 0 0;
		background: var(--h-accent);
		opacity: 0.9;
	}
</style>
