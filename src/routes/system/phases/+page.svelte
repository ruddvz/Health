<script lang="ts">
	import RequiresPlan from '$lib/components/app/RequiresPlan.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import { getPhaseCards } from '$lib/logic/phaseDisplay';
	import { plan } from '$lib/stores/healthApp';

	const cards = $derived(getPhaseCards($plan));
</script>

<RequiresPlan
	title="PHASES"
	subtitle="Targets and focus by program phase"
	emptyTitle="Phases need a plan"
	emptyBody="Import a Health JSON plan or load the demo sample to see calorie targets, macros, and phase notes here."
>
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="PHASES" subtitle="Targets and focus by program phase" />

		{#if cards.length === 0}
			<p class="empty nothing-surface">No phases in this plan.</p>
		{:else}
			{#each cards as c (c.index)}
				<section class="card nothing-surface">
					<div class="head">
						<h2 class="title">{c.idLabel} · {c.name}</h2>
						{#if c.weeksLabel}
							<span class="badge mono-caps">{c.weeksLabel}</span>
						{/if}
					</div>

					<p class="kcal">
						{c.kcalMain}{#if c.kcalHint}<span class="hint"> · {c.kcalHint}</span>{/if}
					</p>

					<div class="macros">
						{#each c.macros as m (m.kind)}
							<span class="chip" data-kind={m.kind}>{m.label} {m.value}</span>
						{/each}
					</div>

					{#if c.description}
						<p class="body">{c.description}</p>
					{/if}
					{#if c.keyFocus}
						<p class="focus">{c.keyFocus}</p>
					{/if}
					{#if c.flavourRotation}
						<div class="note">
							<p class="mono-caps nt">Flavour rotation</p>
							<p class="body">{c.flavourRotation}</p>
						</div>
					{/if}
					{#if c.trainingNote}
						<div class="note">
							<p class="mono-caps nt">Training focus</p>
							<p class="body">{c.trainingNote}</p>
						</div>
					{/if}
				</section>
			{/each}
		{/if}
	</main>
</RequiresPlan>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.empty {
		padding: var(--space-4);
		margin: 0;
		font-size: 14px;
		color: var(--text-2);
	}

	.card {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.title {
		margin: 0;
		font-size: 17px;
		font-weight: 650;
		color: var(--text-1);
		line-height: 1.3;
	}

	.badge {
		font-size: 9px;
		color: var(--text-3);
		padding: 6px 10px;
		border: 1px solid var(--line-1);
		border-radius: var(--radius-pill);
	}

	.kcal {
		margin: 0 0 var(--space-3);
		font-size: 26px;
		font-weight: 650;
		color: var(--text-1);
		letter-spacing: -0.02em;
	}

	.hint {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-2);
	}

	.macros {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: var(--space-3);
	}

	.chip {
		padding: 6px 10px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-1);
		font-size: 12px;
		font-weight: 650;
		color: var(--text-2);
		background: rgba(0, 0, 0, 0.15);
	}

	:global(html[data-theme='light']) .chip {
		background: rgba(0, 0, 0, 0.04);
	}

	.chip[data-kind='p'] {
		border-color: var(--red-line);
		color: var(--text-1);
	}

	.body {
		margin: 0 0 var(--space-2);
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.focus {
		margin: 0 0 var(--space-2);
		font-size: 14px;
		font-weight: 650;
		line-height: 1.45;
		color: var(--text-1);
	}

	.note {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--line-1);
	}

	.nt {
		margin: 0 0 6px;
		font-size: 9px;
		color: var(--text-3);
	}
</style>
