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

<main class="welcome stack">
	<section class="hero health-hero-card">
		<p class="eyebrow">Private iPhone PWA</p>
		<h1 class="headline">Your daily health plan, without the noise.</h1>
		<p class="sub">
			Import a structured plan once. Health turns it into meals, training, progress, reminders, and
			check-ins that stay on your device.
		</p>
		<div class="hero-actions">
			<HealthButton variant="primary" block disabled={sampleBusy} onclick={onSample}>
				{sampleBusy ? 'Loading demo…' : 'Load demo plan'}
			</HealthButton>
			<HealthButton variant="secondary" block href="/import">Import my plan</HealthButton>
		</div>
		<div class="trust">
			<HealthChip tone="green">Local-first</HealthChip>
			<HealthChip tone="blue">Offline-ready</HealthChip>
			<HealthChip>No account</HealthChip>
		</div>
		{#if sampleError}
			<p class="sample-err" role="alert">{sampleError}</p>
		{/if}
	</section>

	<section class="actions" aria-label="Get started">
		<article class="action-card health-card">
			<p class="action-label">Fastest start</p>
			<h2>Explore with a sample plan</h2>
			<p>See Today, Meals, Training, and Progress immediately.</p>
			<HealthButton variant="soft" block disabled={sampleBusy} onclick={onSample}
				>Load demo</HealthButton
			>
		</article>
		<article class="action-card health-card">
			<p class="action-label">Have a plan</p>
			<h2>Paste or upload your plan</h2>
			<p>Your plan is validated on this device before it is saved.</p>
			<HealthButton variant="soft" block href="/import">Import plan</HealthButton>
		</article>
		<article class="action-card health-card">
			<p class="action-label">Need a plan</p>
			<h2>Answer intake questions</h2>
			<p>Generate a prompt you can use to create a compatible plan.</p>
			<HealthButton variant="soft" block onclick={onStartIntake}>Create plan prompt</HealthButton>
		</article>
	</section>

	<PrivacyCard />
	<SafetyCard />

	{#if showContinue}
		<HealthButton variant="ghost" block onclick={onContinueDraft}>
			Continue intake draft · step {onboarding.step} of 6
		</HealthButton>
	{/if}
</main>

<style>
	.welcome {
		flex: 1;
		padding-bottom: var(--space-8);
	}

	.eyebrow {
		margin: 0 0 var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--weight-bold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--health-muted-2);
	}

	.headline {
		margin: 0 0 var(--space-3);
		font-size: clamp(28px, 7vw, var(--text-hero));
		font-weight: var(--weight-bold);
		line-height: var(--leading-tight);
		letter-spacing: -0.03em;
		color: var(--health-ink);
	}

	.sub {
		margin: 0 0 var(--space-5);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--health-muted);
	}

	.hero-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.trust {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.action-card h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-md);
		font-weight: var(--weight-bold);
		color: var(--health-ink);
	}

	.action-card p {
		margin: 0 0 var(--space-4);
		font-size: var(--text-sm);
		color: var(--health-muted);
		line-height: var(--leading-body);
	}

	.action-label {
		margin: 0 0 var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--weight-bold);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--health-amber);
	}

	.sample-err {
		margin: var(--space-3) 0 0;
		font-size: var(--text-sm);
		color: var(--health-red);
	}

	@media (min-width: 1024px) {
		.welcome {
			display: grid;
			grid-template-columns: 1.1fr 1fr;
			gap: var(--space-6);
			align-items: start;
		}

		.hero {
			grid-row: span 2;
		}

		.actions {
			grid-column: 2;
		}
	}
</style>
