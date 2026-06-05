<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import { QUICK_FIX_PRESETS, type QuickFixPreset } from '$lib/logic/quickFixPresets';

	interface Props {
		open: boolean;
		onClose: () => void;
		onPick: (p: QuickFixPreset) => void;
	}
	let { open, onClose, onPick }: Props = $props();
</script>

<BottomSheet {open} title="Quick fix" {onClose}>
	<p class="sub">Adds a logged snack for today. Stored only on this device.</p>
	<div class="grid">
		{#each QUICK_FIX_PRESETS as p (p.label)}
			<button type="button" class="chip pressable" onclick={() => onPick(p)}>
				<span class="name">{p.label}</span>
				<span class="meta">{p.kcal} kcal · P{p.protein_g} C{p.carbs_g} F{p.fat_g}</span>
			</button>
		{/each}
	</div>
	{#snippet footer()}
		<HealthButton variant="ghost" block onclick={onClose}>Close</HealthButton>
	{/snippet}
</BottomSheet>

<style>
	.sub {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.grid {
		display: grid;
		gap: var(--s-2);
	}

	.chip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		width: 100%;
		min-height: 64px;
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
		color: var(--h-text);
		text-align: left;
		cursor: pointer;
	}

	.chip:active {
		background: var(--h-accent-soft);
		border-color: var(--h-accent-line);
	}

	.name {
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
	}

	.meta {
		font-size: var(--t-caption);
		color: var(--h-text-muted);
		letter-spacing: 0.02em;
	}
</style>
