<script lang="ts">
	interface Item {
		time: string;
		title: string;
		subtitle: string;
		state: 'done' | 'next' | 'upcoming';
	}
	interface Props {
		items: Item[];
	}
	let { items }: Props = $props();
</script>

<div class="card nothing-surface" role="list">
	{#each items as it, i (i)}
		<div class="row" role="listitem" data-state={it.state}>
			<span class="time">{it.time}</span>
			<div class="mid">
				<p class="t">{it.title}</p>
				<p class="s">{it.subtitle}</p>
			</div>
			<span
				class="st"
				aria-label={it.state === 'done' ? 'Done' : it.state === 'next' ? 'Next' : 'Upcoming'}
			>
				{it.state === 'done' ? '✓' : it.state === 'next' ? '→' : '·'}
			</span>
		</div>
	{/each}
</div>

<style>
	.card {
		padding: 0;
		overflow: hidden;
		margin-bottom: var(--s-3);
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: var(--s-3);
		padding: var(--s-3) var(--s-4);
		border-bottom: 1px solid var(--h-line-soft);
	}

	.row:last-child {
		border-bottom: none;
	}

	.row[data-state='next'] {
		background: var(--h-accent-soft);
		border-left: 3px solid var(--h-accent);
		padding-left: calc(var(--s-4) - 3px);
	}

	.time {
		width: 64px;
		flex-shrink: 0;
		margin: 2px 0 0;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.row[data-state='next'] .time {
		color: var(--h-accent);
	}

	.mid {
		flex: 1;
		min-width: 0;
	}

	.t {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.row[data-state='next'] .t {
		color: var(--h-text);
	}

	.s {
		margin: var(--s-1) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-caption);
	}

	.st {
		margin-top: 2px;
		color: var(--h-text-faint);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
	}

	.row[data-state='done'] .st {
		color: var(--h-accent);
	}

	.row[data-state='next'] .st {
		color: var(--h-accent);
	}
</style>
