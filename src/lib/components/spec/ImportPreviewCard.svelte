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

	const errors = $derived(issues.filter((i) => i.level === 'error'));
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

	{#if errors.length}
		<div class="err-block" role="alert">
			<p class="err-t">Errors ({errors.length})</p>
			<ul>
				{#each errors as e (e.code + e.path)}
					<li>{e.message}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if warnings.length}
		<div class="warn-block" role="status">
			<p class="warn-t">Warnings ({warnings.length})</p>
			<ul>
				{#each warnings as w (w.code + w.path)}
					<li>{w.message}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if infos.length}
		<div class="info-block" role="status">
			<p class="info-t">Notes ({infos.length})</p>
			<ul>
				{#each infos as w (w.code + w.path)}
					<li>{w.message}</li>
				{/each}
			</ul>
		</div>
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
		padding: var(--s-4);
		margin-bottom: var(--s-4);
		border-radius: var(--r-card);
		border: 1px solid var(--h-line);
	}

	.title {
		margin: 0 0 var(--s-1);
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.sub {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.grid {
		display: grid;
		gap: var(--phone-card-gap);
		margin-bottom: var(--s-3);
	}

	.cell {
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		background: var(--h-surface-2);
		border: 1px solid var(--h-line-soft);
	}

	.lab {
		margin: 0 0 var(--s-1);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.val {
		margin: 0;
		font-size: var(--t-footnote);
		color: var(--h-text);
		line-height: var(--lh-body);
	}

	.err-block,
	.warn-block,
	.info-block {
		margin-bottom: var(--s-3);
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
	}

	.err-block {
		border: 1px solid var(--h-red-line);
		background: var(--h-red-soft);
	}

	.warn-block {
		border: 1px solid var(--h-orange-line);
		background: var(--h-orange-soft);
	}

	.info-block {
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
	}

	.err-t {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-red);
	}

	.warn-t {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-orange);
	}

	.info-t {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-muted);
	}

	ul {
		margin: 0;
		padding-left: 1.1rem;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.note {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}

	.actions {
		display: flex;
		gap: var(--phone-card-gap);
	}

	.ghost,
	.apply {
		flex: 1;
		min-height: 48px;
		border-radius: var(--r-pill);
		font-weight: var(--weight-semibold);
		font-size: var(--t-body);
		cursor: pointer;
	}

	.ghost {
		border: 1px solid var(--h-line-strong);
		background: transparent;
		color: var(--h-text);
	}

	.apply {
		border: none;
		background: var(--h-accent);
		color: var(--health-primary-text);
		box-shadow: var(--shadow-glow);
	}
</style>
