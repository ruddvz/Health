<script lang="ts">
	interface Props {
		items?: string[];
	}
	let { items = ['Local only', 'Offline ready'] }: Props = $props();
</script>

<div class="strip" role="status" aria-live="off">
	{#each items as item (item)}
		<span class="pill">
			<span class="dot" aria-hidden="true"></span>
			<span class="label">{item}</span>
		</span>
	{/each}
</div>

<style>
	.strip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		min-height: 32px;
		padding: 0 0 var(--s-3);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 28px;
		padding: 0 var(--s-3);
		border-radius: var(--r-pill);
		background: var(--h-surface-2);
		border: 1px solid var(--h-line);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--h-accent);
		box-shadow: 0 0 8px var(--h-accent-line);
		flex-shrink: 0;
	}

	.label {
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-muted);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
</style>
