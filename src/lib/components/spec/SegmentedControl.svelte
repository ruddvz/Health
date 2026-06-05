<script lang="ts">
	interface Opt {
		label: string;
		value: string;
	}
	interface Props {
		options: Opt[];
		selected: string;
		onSelect?: (value: string) => void;
	}
	let { options, selected, onSelect }: Props = $props();
</script>

<div class="segmented" role="group">
	{#each options as o (o.value)}
		<button
			type="button"
			class="seg-btn pressable"
			class:on={selected === o.value}
			aria-pressed={selected === o.value}
			onclick={() => onSelect?.(o.value)}
		>
			{o.label}
		</button>
	{/each}
</div>

<style>
	.segmented {
		display: grid;
		grid-auto-flow: column;
		gap: 4px;
		min-height: 44px;
		padding: 4px;
		border-radius: var(--r-pill);
		background: rgba(255, 255, 255, 0.055);
		border: 1px solid var(--h-line);
		margin-bottom: var(--s-3);
	}

	.seg-btn {
		border: none;
		background: transparent;
		padding: 8px 12px;
		border-radius: var(--r-pill);
		font-size: var(--t-footnote);
		font-weight: 650;
		color: var(--h-text-muted);
		cursor: pointer;
		min-height: 36px;
	}

	.seg-btn.on {
		background: var(--h-surface-3);
		color: var(--h-text);
		box-shadow: inset 0 0 0 1px var(--h-line-strong);
	}
</style>
