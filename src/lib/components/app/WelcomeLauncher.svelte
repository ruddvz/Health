<script lang="ts">
	import { resolve } from '$app/paths';
	import { loadSamplePlan } from '$lib/logic/loadSamplePlan';
	import { hasOnboardingDraft } from '$lib/logic/onboardingDraft';
	import type { OnboardingState } from '$lib/types/planV2';

	interface Props {
		onboarding: OnboardingState;
		onStartIntake: () => void;
		onContinueDraft: () => void;
	}

	let { onboarding, onStartIntake, onContinueDraft }: Props = $props();

	let sampleBusy = $state(false);
	let sampleError = $state<string | null>(null);

	const showContinue = $derived(hasOnboardingDraft(onboarding));

	async function onSample() {
		if (
			!confirm('Load the demo sample plan? It is labeled as a demo and stored only on this device.')
		) {
			return;
		}
		sampleBusy = true;
		sampleError = null;
		try {
			await loadSamplePlan();
		} catch (e) {
			sampleError = e instanceof Error ? e.message : 'Could not load sample plan';
		} finally {
			sampleBusy = false;
		}
	}
</script>

<main class="welcome px-screen pt-safe stack">
	<header class="hero nothing-surface">
		<p class="brand mono-caps">Health</p>
		<h1 class="headline">Your private daily health plan, offline on your iPhone.</h1>
		<p class="sub">
			Build or import a structured plan — then use Today, Meals, Train, and Progress without raw
			JSON.
		</p>
	</header>

	<section class="paths" aria-label="Get started">
		<button type="button" class="path-card pressable" onclick={onStartIntake}>
			<p class="path-title">Create plan prompt</p>
			<p class="path-sub">Answer a few questions and copy a Claude prompt for your JSON plan.</p>
		</button>
		<a class="path-card pressable" href={resolve('/import')}>
			<p class="path-title">Import JSON</p>
			<p class="path-sub">Paste or upload a plan you already have.</p>
		</a>
	</section>

	<section class="demo nothing-surface">
		<p class="demo-label">Demo</p>
		<p class="demo-body">
			Load a labeled sample plan to explore the app before importing your own.
		</p>
		<button type="button" class="sample-btn pressable" disabled={sampleBusy} onclick={onSample}>
			{sampleBusy ? 'Loading sample…' : 'Load sample plan (demo)'}
		</button>
		{#if sampleError}
			<p class="sample-err" role="alert">{sampleError}</p>
		{/if}
	</section>

	<section class="privacy nothing-surface">
		<p class="privacy-title">Privacy</p>
		<p class="privacy-body">
			No account required. Data stays on this device unless you enable Health Lock encryption or
			optional cloud backup later.
		</p>
		<p class="privacy-body safety">
			Health is a planning companion — not medical diagnosis or emergency advice. Review major diet,
			supplement, medication, or training changes with a qualified professional.
		</p>
	</section>

	{#if showContinue}
		<button type="button" class="continue pressable" onclick={onContinueDraft}>
			Continue intake draft · step {onboarding.step} of 6
		</button>
	{/if}
</main>

<style>
	.welcome {
		flex: 1;
		padding-bottom: var(--space-8);
	}

	.hero {
		padding: var(--space-5) var(--space-4);
		margin-bottom: var(--space-4);
		border-radius: var(--radius-card, var(--radius-lg));
	}

	.brand {
		margin: 0 0 var(--space-3);
		font-size: 11px;
		color: var(--text-3);
		letter-spacing: 0.12em;
	}

	.headline {
		margin: 0 0 var(--space-3);
		font-size: 26px;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
		color: var(--text-1);
	}

	.sub {
		margin: 0;
		font-size: 15px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.paths {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: var(--space-4);
	}

	.path-card {
		display: block;
		width: 100%;
		padding: var(--space-4);
		text-align: left;
		border-radius: var(--radius-control, var(--radius-md));
		border: 1px solid var(--line-1);
		background: var(--surface-1);
		color: inherit;
		cursor: pointer;
		text-decoration: none;
	}

	.path-title {
		margin: 0 0 6px;
		font-size: 17px;
		font-weight: 650;
		color: var(--text-1);
	}

	.path-sub {
		margin: 0;
		font-size: 14px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.demo {
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		border-radius: var(--radius-md);
	}

	.demo-label {
		margin: 0 0 var(--space-2);
		font-size: 11px;
		color: var(--text-3);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-body {
		margin: 0 0 var(--space-3);
		font-size: 14px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.privacy {
		padding: var(--space-4);
		margin-top: var(--space-2);
		border-radius: var(--radius-md);
	}

	.privacy-title {
		margin: 0 0 var(--space-2);
		font-size: 13px;
		font-weight: 650;
		color: var(--text-1);
	}

	.privacy-body {
		margin: 0 0 var(--space-2);
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.privacy-body.safety {
		font-size: 13px;
		color: var(--text-3);
	}

	.continue {
		width: 100%;
		min-height: 48px;
		margin-top: var(--space-4);
		padding: 12px 16px;
		border-radius: var(--radius-control, var(--radius-sm));
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}

	.sample-btn {
		width: 100%;
		min-height: 44px;
		padding: 10px 14px;
		border: 1px dashed var(--line-2);
		border-radius: var(--radius-control, var(--radius-sm));
		background: transparent;
		color: var(--text-2);
		font-size: 15px;
		cursor: pointer;
	}

	.sample-err {
		margin: var(--space-2) 0 0;
		font-size: 13px;
		color: var(--danger, var(--red));
	}
</style>
