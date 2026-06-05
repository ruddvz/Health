<script lang="ts">
	interface Props {
		index: number;
		name: string;
		setsReps: string;
		rest: string;
	}
	let { index, name, setsReps, rest }: Props = $props();
</script>

<div class="row nothing-surface-2">
	<span class="idx">{index}</span>
	<div class="mid">
		<p class="n">{name}</p>
		<p class="s">{setsReps}</p>
	</div>
	<p class="r">{rest}</p>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-height: 92px;
		padding: var(--s-3) var(--s-4);
		margin-bottom: var(--s-2);
	}

	.idx {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--r-xxs);
		background: var(--h-surface-3);
		text-align: center;
		color: var(--h-text-faint);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		flex-shrink: 0;
	}

	.mid {
		flex: 1;
		min-width: 0;
	}

	.n {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.s {
		margin: var(--s-1) 0 0;
		font-size: var(--t-caption);
		color: var(--h-text-muted);
	}

	.r {
		margin: 0;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
		flex-shrink: 0;
	}
</style>
