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
	import type { ValidationIssue } from '$lib/validation/issues';
	import { get } from 'svelte/store';

	const hasPlan = $derived(Boolean($plan));

	const diag = $derived.by(() => {
		if (!browser) {
			return {
				noPlan: true,
				issues: [] as ValidationIssue[],
				parseWarnings: [] as string[]
			};
		}
		const raw = localStorage.getItem(LS_PLAN);
		if (!raw)
			return { noPlan: true, issues: [] as ValidationIssue[], parseWarnings: [] as string[] };
		const r = parsePlanJsonText(raw);
		if (!r.ok) {
			return { noPlan: false, issues: r.issues, parseWarnings: r.warnings };
		}
		return { noPlan: false, issues: r.issues, parseWarnings: r.warnings };
	});

	const liveImport = $derived($importWarnings);
	const displayIssues = $derived.by((): ValidationIssue[] => {
		const fromParse = diag.issues.filter((i) => i.level !== 'info');
		const extra: ValidationIssue[] = liveImport.map((m) => ({
			level: 'warning',
			code: 'IMPORT_RUNTIME',
			path: 'import',
			message: m
		}));
		return [...fromParse, ...extra];
	});

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
	{:else}
		{@const errors = displayIssues.filter((i) => i.level === 'error')}
		{@const warnings = displayIssues.filter((i) => i.level === 'warning')}
		{#if errors.length === 0}
			<section class="ok nothing-surface" role="status">
				<p class="mono-caps t">Schema</p>
				<p class="b">Plan JSON parses and required sections are present.</p>
			</section>
		{/if}
		{#each errors as issue (issue.code + issue.path)}
			<section class="err nothing-surface" role="alert">
				<p class="mono-caps t">{issue.code}</p>
				<p class="b">{issue.message}</p>
				{#if issue.fixHint}
					<p class="hint">{issue.fixHint}</p>
				{/if}
			</section>
		{/each}
		{#if warnings.length}
			<section class="warn nothing-surface">
				<p class="mono-caps t">Warnings ({warnings.length})</p>
				<ul>
					{#each warnings as issue (issue.code + issue.path)}
						<li>
							<span class="code">{issue.code}</span>
							{issue.message}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
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

	.hint {
		margin: var(--space-2) 0 0;
		font-size: 13px;
		color: var(--text-3);
		line-height: 1.45;
	}

	.err .t {
		color: var(--danger, var(--red));
	}

	ul {
		margin: 0;
		padding-left: 0;
		list-style: none;
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-2);
	}

	li {
		margin-bottom: var(--space-2);
	}

	.code {
		display: block;
		font-size: 9px;
		color: var(--text-3);
		letter-spacing: 0.06em;
		margin-bottom: 2px;
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
