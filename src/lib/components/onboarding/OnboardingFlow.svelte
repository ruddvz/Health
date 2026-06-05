<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import RedActionButton from '$lib/components/nothing/RedActionButton.svelte';
	import ProgressHeader from '$lib/components/spec/ProgressHeader.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import StatusStrip from '$lib/components/spec/StatusStrip.svelte';
	import StepCard from '$lib/components/spec/StepCard.svelte';
	import TextLinkButton from '$lib/components/spec/TextLinkButton.svelte';
	import InlineErrorCard from '$lib/components/spec/InlineErrorCard.svelte';
	import ReviewImportSheet from '$lib/components/onboarding/ReviewImportSheet.svelte';
	import StepAbout from '$lib/components/onboarding/StepAbout.svelte';
	import StepDiet from '$lib/components/onboarding/StepDiet.svelte';
	import StepGoal from '$lib/components/onboarding/StepGoal.svelte';
	import StepLifestyle from '$lib/components/onboarding/StepLifestyle.svelte';
	import StepSupplements from '$lib/components/onboarding/StepSupplements.svelte';
	import StepTraining from '$lib/components/onboarding/StepTraining.svelte';
	import { applyIntakeStepDefaults } from '$lib/logic/intakeStepDefaults';
	import { intakeErrorSummary } from '$lib/logic/intakeUi';
	import type { IntakeErrors } from '$lib/logic/onboardingValidation';
	import {
		intakeErrorKeysForStep,
		validateIntakeComplete,
		validateIntakeStep
	} from '$lib/logic/onboardingValidation';
	import type { OnboardingState } from '$lib/types/planV2';
	import { onboarding, persistOnboarding } from '$lib/stores/healthApp';
	import '$lib/styles/onboarding-form.css';

	const stepMeta = [
		{ label: 'STEP 1 OF 6', progress: 1 / 6, title: 'About you', sub: 'Basics & measurements' },
		{ label: 'STEP 2 OF 6', progress: 2 / 6, title: 'Your goal', sub: 'Timeline & pace' },
		{ label: 'STEP 3 OF 6', progress: 3 / 6, title: 'Training', sub: 'Gym context & limits' },
		{
			label: 'STEP 4 OF 6',
			progress: 4 / 6,
			title: 'Food & kitchen',
			sub: 'Diet, allergies, cooking'
		},
		{ label: 'STEP 5 OF 6', progress: 5 / 6, title: 'Supplements', sub: 'What you have & budget' },
		{ label: 'STEP 6 OF 6', progress: 1, title: 'Life & place', sub: 'Country, rhythm, stress' }
	] as const;

	const stepRail = [
		{ id: 1 as const, title: 'About you', sub: 'Basics & measurements' },
		{ id: 2 as const, title: 'Your goal', sub: 'Timeline & pace' },
		{ id: 3 as const, title: 'Training', sub: 'Gym context & limits' },
		{ id: 4 as const, title: 'Food & kitchen', sub: 'Diet, allergies, cooking' },
		{ id: 5 as const, title: 'Supplements', sub: 'What you have & budget' },
		{ id: 6 as const, title: 'Life & place', sub: 'Country, rhythm, stress' }
	];

	function patch(p: Partial<OnboardingState>) {
		persistOnboarding({ ...$onboarding, ...p });
	}

	let fieldErrors = $state<IntakeErrors>({});
	let reviewOpen = $state(false);

	function goImport() {
		if (
			!browser ||
			!window.confirm(
				'Skip intake for now? The Claude prompt will contain many "not specified" fields until you finish this form.'
			)
		) {
			return;
		}
		goto(resolve('/import'));
	}

	function goBack() {
		const s = $onboarding.step;
		if (s <= 1) return;
		fieldErrors = {};
		patch({ step: (s - 1) as 1 | 2 | 3 | 4 | 5 | 6 });
	}

	function continuePrimary() {
		const s = $onboarding.step;
		const v = validateIntakeStep(s, $onboarding);
		fieldErrors = v.errors;
		if (!v.ok) return;
		fieldErrors = {};
		if (s < 6) {
			patch({ step: (s + 1) as 1 | 2 | 3 | 4 | 5 | 6 });
		} else {
			reviewOpen = true;
		}
	}

	function closeReview() {
		reviewOpen = false;
	}

	function confirmGoImport() {
		const v = validateIntakeComplete($onboarding);
		fieldErrors = v.errors;
		if (!v.ok) return;
		fieldErrors = {};
		patch({ confirmed: true });
		reviewOpen = false;
		goto(resolve('/import'));
	}

	function dismissIntakeNotice() {
		patch({ expandedIntakeNoticePending: false });
	}

	function useExampleValuesForThisStep() {
		const s = $onboarding.step;
		const next = applyIntakeStepDefaults(s, $onboarding);
		persistOnboarding(next);
		const removable = new Set(intakeErrorKeysForStep(s));
		fieldErrors = Object.fromEntries(
			Object.entries(fieldErrors).filter(([k]) => !removable.has(k))
		);
	}
</script>

<main class="screen px-screen pt-safe stack">
	<StatusStrip />

	{#if $onboarding.expandedIntakeNoticePending}
		<div class="banner nothing-surface" role="status">
			<p class="bn-t">
				Intake was expanded. Your previous answers are kept — review each step for new questions.
			</p>
			<button type="button" class="bn-dismiss pressable" onclick={dismissIntakeNotice}>Dismiss</button>
		</div>
	{/if}

	{#if Object.keys(fieldErrors).length > 0}
		<InlineErrorCard title="Fix the items below" body={intakeErrorSummary(fieldErrors)} />
	{/if}

	<p class="saved-hint mono-caps">Answers save automatically on this device.</p>

	<ProgressHeader
		label={stepMeta[$onboarding.step - 1].label}
		progress={stepMeta[$onboarding.step - 1].progress}
	/>

	<ScreenHeaderBlock
		title={stepMeta[$onboarding.step - 1].title}
		subtitle={stepMeta[$onboarding.step - 1].sub}
	/>

	<StepCard
		index={$onboarding.step}
		title={stepRail[$onboarding.step - 1].title}
		subtitle={stepRail[$onboarding.step - 1].sub}
		status="current"
	/>

	{#if $onboarding.step === 1}
		<StepAbout {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{:else if $onboarding.step === 2}
		<StepGoal {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{:else if $onboarding.step === 3}
		<StepTraining {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{:else if $onboarding.step === 4}
		<StepDiet {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{:else if $onboarding.step === 5}
		<StepSupplements {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{:else}
		<StepLifestyle {fieldErrors} onUseDefaults={useExampleValuesForThisStep} />
	{/if}

	<div class="nav-actions">
		{#if $onboarding.step > 1}
			<TextLinkButton text="Back" onclick={goBack} />
		{/if}
		<RedActionButton
			label={$onboarding.step < 6 ? 'Continue' : 'Review & import'}
			onclick={continuePrimary}
		/>
		<TextLinkButton text="Skip for now" onclick={goImport} />
	</div>
</main>

<ReviewImportSheet open={reviewOpen} onClose={closeReview} onConfirm={confirmGoImport} />
