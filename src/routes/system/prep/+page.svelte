<script lang="ts">
	import RequiresPlan from '$lib/components/app/RequiresPlan.svelte';
	import PrepStepCard from '$lib/components/spec/PrepStepCard.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SectionTitleBlock from '$lib/components/spec/SectionTitleBlock.svelte';
	import TipCard from '$lib/components/spec/TipCard.svelte';
	import { getPrepSteps } from '$lib/logic/planDerive';
	import { persistProgress, plan, progress } from '$lib/stores/healthApp';
	import { get } from 'svelte/store';

	const steps = $derived(getPrepSteps($plan));
	const pg = $derived(($plan?.prep_guide ?? {}) as Record<string, unknown>);
	const totalMin = $derived(typeof pg.total_minutes === 'number' ? pg.total_minutes : 0);

	function checked(key: string) {
		return !!get(progress).prepChecked?.[key];
	}

	function toggle(key: string) {
		const cur = get(progress);
		const pc = { ...(cur.prepChecked ?? {}) };
		pc[key] = !pc[key];
		persistProgress({ ...cur, prepChecked: pc });
	}
</script>

<RequiresPlan
	title="Prep"
	emptyTitle="Prep guide needs a plan"
	emptyBody="Sunday prep steps and timing come from your plan JSON. Import a plan or load the sample to track prep checkboxes locally."
>
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="Prep" subtitle="Sunday batch cooking steps" />
		<SectionTitleBlock title="Sunday prep" subtitle={`Estimated time: ${totalMin || '—'} min`} />

		{#each steps as s (s.key)}
			<PrepStepCard
				title={s.title}
				subtitle={s.subtitle || ' '}
				time={`${s.minutes}m`}
				checked={checked(s.key)}
				onToggle={() => toggle(s.key)}
			/>
		{/each}

		<section class="safety nothing-surface" aria-labelledby="prep-safety-h">
			<h2 id="prep-safety-h" class="mono-caps safety-title">Food safety</h2>
			<p class="safety-body">
				Cool cooked food quickly, store in clean containers, and reheat until steaming hot
				throughout. Follow local guidance for safe internal temperatures (e.g. poultry). When in
				doubt, throw it out.
			</p>
		</section>

		<TipCard
			title="Prep Tip"
			body={(Array.isArray(pg.tips) && pg.tips[0] && typeof pg.tips[0] === 'string'
				? pg.tips[0]
				: 'Batch cooking saves time and keeps you consistent.') + ''}
		/>
	</main>
</RequiresPlan>

<style>
	.safety {
		padding: var(--space-4);
		margin-top: var(--space-3);
	}

	.safety-title {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
	}

	.safety-body {
		margin: 0;
		font-size: 14px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}
</style>
