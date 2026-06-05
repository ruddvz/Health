<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LS_PLAN } from '$lib/constants/storage';
	import { onboarding, persistOnboarding, importWarnings, plan } from '$lib/stores/healthApp';
	import { parsePlanJsonText } from '$lib/validation/planV2';
	import { get } from 'svelte/store';

	const hasPlan = $derived(Boolean($plan));

	const diag = $derived.by(() => {
		if (!browser)
			return { noPlan: true, error: null as string | null, parseWarnings: [] as string[] };
		const raw = localStorage.getItem(LS_PLAN);
		if (!raw) return { noPlan: true, error: null, parseWarnings: [] as string[] };
		const r = parsePlanJsonText(raw);
		if (!r.ok) return { noPlan: false, error: r.error, parseWarnings: r.warnings };
		return { noPlan: false, error: null, parseWarnings: r.warnings };
	});

	const allWarnings = $derived([...diag.parseWarnings, ...$importWarnings]);

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="DIAGNOSTICS" subtitle="Plan health" />

	{#if !hasPlan || diag.noPlan}
		<EmptyState
			title="No plan loaded"
			body="No validation has run yet. Import a plan to inspect schema, meals, supplements, training, schedule, and safety warnings."
		>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	{:else if diag.error}
		<section class="err nothing-surface" role="status">
			<p class="mono-caps t">Validation error</p>
			<p class="b">{diag.error}</p>
		</section>
	{:else}
		<section class="ok nothing-surface" role="status">
			<p class="mono-caps t">Schema</p>
			<p class="b">Plan JSON parses and required sections are present.</p>
		</section>
	{/if}

	{#if hasPlan && allWarnings.length}
		<section class="warn nothing-surface">
			<p class="mono-caps t">Warnings</p>
			<ul>
				{#each allWarnings as w, i (i)}
					<li>{w}</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if hasPlan && !diag.error && !diag.noPlan}
		<a class="import-link" href={resolve('/import')}>Re-import or replace plan</a>
	{/if}
</main>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.err,
	.ok,
	.warn {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
	}

	.t {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
	}

	.b {
		margin: 0;
		font-size: 14px;
		color: var(--text-2);
		line-height: 1.5;
	}

	.err .t {
		color: var(--danger, var(--red));
	}

	ul {
		margin: 0;
		padding-left: 1.1rem;
		color: var(--text-2);
		font-size: 14px;
		line-height: 1.55;
	}

	.import-link {
		display: inline-block;
		margin-top: var(--space-2);
		font-size: 14px;
		color: var(--text-2);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
