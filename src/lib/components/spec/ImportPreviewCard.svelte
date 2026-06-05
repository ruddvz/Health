<script lang="ts">
	import type { ImportPreview } from '$lib/logic/importPreview';
	import type { ValidationIssue } from '$lib/validation/issues';

	interface Props {
		preview: ImportPreview;
		issues: ValidationIssue[];
		onApply: () => void;
		onCancel: () => void;
		busy?: boolean;
	}

	let { preview, issues, onApply, onCancel, busy = false }: Props = $props();

	const warnings = $derived(issues.filter((i) => i.level === 'warning'));
	const infos = $derived(issues.filter((i) => i.level === 'info'));
</script>

<section class="preview nothing-surface" aria-labelledby="preview-h">
	<h2 id="preview-h" class="title">{preview.title}</h2>
	<p class="sub">Schema {preview.schemaVersion} · {preview.phaseCount} phase(s)</p>

	<div class="grid">
		<div class="cell">
			<p class="lab">Goal</p>
			<p class="val">{preview.goal}</p>
		</div>
		<div class="cell">
			<p class="lab">Workout day</p>
			<p class="val">{preview.workoutKcal} · {preview.proteinG} protein</p>
		</div>
		<div class="cell">
			<p class="lab">Meals</p>
			<p class="val">{preview.workoutMeals} workout · {preview.restMeals} rest</p>
		</div>
		<div class="cell">
			<p class="lab">Training</p>
			<p class="val">{preview.trainingDays} day(s) in weekly_split</p>
		</div>
	</div>

	{#if warnings.length}
		<div class="warn-block" role="status">
			<p class="mono-caps warn-t">Warnings ({warnings.length})</p>
			<ul>
				{#each warnings as w (w.code + w.path)}
					<li>{w.message}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if infos.length}
		<ul class="info">
			{#each infos as w (w.code + w.path)}
				<li>{w.message}</li>
			{/each}
		</ul>
	{/if}

	<p class="note">
		Applying saves this plan only on this device. Review warnings before you rely on supplement or
		calorie targets.
	</p>

	<div class="actions">
		<button type="button" class="ghost pressable" disabled={busy} onclick={onCancel}>Cancel</button>
		<button type="button" class="apply pressable" disabled={busy} onclick={onApply}>
			{busy ? 'Saving…' : 'Apply plan'}
		</button>
	</div>
</section>

<style>
	.preview {
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		border-radius: var(--radius-card, var(--radius-lg));
		border: 1px solid var(--line-1);
	}

	.title {
		margin: 0 0 4px;
		font-size: 20px;
		font-weight: 700;
		color: var(--text-1);
	}

	.sub {
		margin: 0 0 var(--space-4);
		font-size: 13px;
		color: var(--text-3);
	}

	.grid {
		display: grid;
		gap: 10px;
		margin-bottom: var(--space-3);
	}

	.cell {
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
	}

	.lab {
		margin: 0 0 4px;
		font-size: 10px;
		color: var(--text-3);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.val {
		margin: 0;
		font-size: 14px;
		color: var(--text-1);
		line-height: 1.4;
	}

	.warn-block {
		margin-bottom: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid rgba(255, 159, 10, 0.35);
		background: rgba(255, 159, 10, 0.08);
	}

	.warn-t {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--warning);
	}

	ul {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.info {
		margin: 0 0 var(--space-3);
		padding-left: 1.1rem;
		font-size: 13px;
		color: var(--text-3);
	}

	.note {
		margin: 0 0 var(--space-4);
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-3);
	}

	.actions {
		display: flex;
		gap: 10px;
	}

	.ghost,
	.apply {
		flex: 1;
		min-height: 48px;
		border-radius: var(--radius-control, var(--radius-sm));
		font-weight: 650;
		font-size: 16px;
		cursor: pointer;
	}

	.ghost {
		border: 1px solid var(--line-2);
		background: transparent;
		color: var(--text-1);
	}

	.apply {
		border: none;
		background: var(--accent, var(--ios-blue));
		color: #fff;
	}
</style>
