<script lang="ts">
	import { loadSamplePlan } from '$lib/logic/loadSamplePlan';
	import { hasOnboardingDraft } from '$lib/logic/onboardingDraft';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import HealthChip from '$lib/components/ui/HealthChip.svelte';
	import PrivacyCard from '$lib/components/ui/PrivacyCard.svelte';
	import SafetyCard from '$lib/components/ui/SafetyCard.svelte';
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
		if (!confirm('Load the demo plan? It stays on this device and you can replace it anytime.')) {
			return;
		}
		sampleBusy = true;
		sampleError = null;
		try {
			await loadSamplePlan();
		} catch (e) {
			sampleError = e instanceof Error ? e.message : 'Could not load demo plan';
		} finally {
			sampleBusy = false;
		}
	}
</script>

<main class="welcome page-stack">
	<section class="hero hero-card">
		<p class="eyebrow">Private health plan</p>
		<h1 class="headline">Your private daily health plan.</h1>
		<p class="sub">Offline on your iPhone.</p>
		<p class="body">
			Import a structured plan and use Today, Meals, Training, and Progress without digging through
			raw JSON.
		</p>
		<div class="hero-actions">
			<HealthButton variant="primary" size="lg" block href="/import">Import plan</HealthButton>
			<HealthButton variant="secondary" size="lg" block onclick={onStartIntake}
				>Create plan prompt</HealthButton
			>
			<HealthButton variant="ghost" block disabled={sampleBusy} onclick={onSample}>
				{sampleBusy ? 'Loading demo…' : 'Try demo plan'}
			</HealthButton>
		</div>
		<div class="trust">
			<HealthChip tone="green">Local-first</HealthChip>
			<HealthChip tone="blue">Offline-ready</HealthChip>
		</div>
		{#if sampleError}
			<p class="sample-err" role="alert">{sampleError}</p>
		{/if}
	</section>

	<div class="welcome__side page-stack">
		<PrivacyCard />
		<article class="demo-card card">
			<p class="demo-label">Preview</p>
			<h2>See how Health works</h2>
			<p>Load a sample plan to explore Today, Meals, Training, and Progress.</p>
			<HealthButton variant="soft" block disabled={sampleBusy} onclick={onSample}
				>Try demo plan</HealthButton
			>
		</article>
		<SafetyCard />
	</div>

	{#if showContinue}
		<HealthButton variant="ghost" block onclick={onContinueDraft}>
			Continue intake draft · step {onboarding.step} of 6
		</HealthButton>
	{/if}
</main>

<style>
	.welcome {
		padding-top: 8px;
	}

	.hero {
		min-height: 360px;
		padding: 24px;
	}

	.eyebrow {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--h-accent);
	}

	.headline {
		margin: 0 0 var(--s-3);
		font-size: clamp(32px, 8vw, 42px);
		font-weight: 780;
		line-height: var(--lh-tight);
		letter-spacing: -0.03em;
		color: var(--h-text);
	}

	.sub {
		margin: 0 0 var(--s-2);
		font-size: var(--t-body);
		color: var(--h-text-muted);
	}

	.body {
		margin: 0 0 var(--s-5);
		font-size: var(--t-callout);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
		max-width: 36ch;
	}

	.hero-actions {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		margin-bottom: var(--s-4);
	}

	.trust {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.demo-card h2 {
		margin: 0 0 var(--s-2);
		font-size: var(--t-body-lg);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.demo-card p {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.demo-label {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-bold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--h-text-faint);
	}

	.sample-err {
		margin: var(--s-3) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-red);
	}

	@media (min-width: 768px) {
		.welcome {
			display: grid;
			grid-template-columns: 1.1fr 1fr;
			gap: var(--desktop-card-gap);
			max-width: 1080px;
			margin-inline: auto;
			align-items: start;
		}

		.hero {
			grid-row: span 2;
		}
	}
</style>
