<script lang="ts">
	interface Props {
		label: string;
		phaseCount: number;
		phaseIndex: number;
		onPhaseChange?: (index: number) => void;
	}
	let { label, phaseCount, phaseIndex, onPhaseChange }: Props = $props();
</script>

<div class="row nothing-surface-2">
	<span class="lab">{label}</span>
	{#if phaseCount > 1}
		<label class="sr" for="phase-select">Select phase</label>
		<select
			id="phase-select"
			class="sel"
			onchange={(e) => onPhaseChange?.(Number((e.target as HTMLSelectElement).value))}
		>
			{#each Array.from({ length: phaseCount }, (_, i) => i) as i (i)}
				<option value={i} selected={i === phaseIndex}>Phase {i + 1}</option>
			{/each}
		</select>
	{:else}
		<span class="chev" aria-hidden="true">▾</span>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 44px;
		padding: var(--s-3) var(--s-4);
		margin-bottom: var(--s-2);
	}

	.lab {
		margin: 0;
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		color: var(--h-text-soft);
	}

	.sel {
		appearance: none;
		min-height: 44px;
		padding: 0 36px 0 var(--s-3);
		border-radius: var(--r-pill);
		border: 1px solid var(--h-line-strong);
		background: var(--h-surface-3)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23737f77' d='M1 1.5L6 6l5-4.5'/%3E%3C/svg%3E")
			no-repeat right 10px center;
		color: var(--h-text);
		font-family: var(--font-ui);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}

	@supports (corner-shape: squircle) {
		.sel {
			corner-shape: squircle;
		}
	}

	.chev {
		margin: 0;
		font-size: var(--t-caption);
		color: var(--h-text-faint);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
