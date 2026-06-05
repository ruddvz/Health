<script lang="ts">
	interface Props {
		chips: string[];
		selected: string;
		onSelect?: (label: string) => void;
	}
	let { chips, selected, onSelect }: Props = $props();
</script>

<div class="row" role="tablist">
	{#each chips as c (c)}
		<button
			type="button"
			class="chip pressable"
			class:on={selected === c}
			aria-selected={selected === c}
			role="tab"
			onclick={() => onSelect?.(c)}
		>
			{c}
		</button>
	{/each}
</div>

<style>
	.row {
		display: flex;
		flex-wrap: nowrap;
		gap: var(--s-2);
		margin-bottom: var(--s-3);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-bottom: var(--s-1);
	}

	.row::-webkit-scrollbar {
		display: none;
	}

	.chip {
		flex-shrink: 0;
		border: 1px solid var(--h-line);
		background: var(--h-surface-solid);
		color: var(--h-text-muted);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		min-height: 36px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		cursor: pointer;
	}

	.chip.on {
		border-color: var(--h-accent-line);
		color: var(--h-accent);
		background: var(--h-accent-soft);
	}
</style>
