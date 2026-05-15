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
	<span class="mono-caps lab">{label}</span>
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
		<span class="chev mono-caps" aria-hidden="true">▾</span>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: 44px;
		padding: 10px var(--space-4);
		margin-bottom: var(--space-2);
	}

	.lab {
		margin: 0;
		font-size: 10px;
		color: var(--text-2);
		letter-spacing: 0.09em;
	}

	.sel {
		appearance: none;
		min-height: 36px;
		padding: 0 36px 0 12px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: rgba(0, 0, 0, 0.35)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23777771' d='M1 1.5L6 6l5-4.5'/%3E%3C/svg%3E")
			no-repeat right 10px center;
		color: var(--text-1);
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
	}

	@supports (corner-shape: squircle) {
		.sel {
			corner-shape: squircle;
		}
	}

	.chev {
		margin: 0;
		font-size: 10px;
		color: var(--text-3);
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
