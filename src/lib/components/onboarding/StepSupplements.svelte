<script lang="ts">
	import IntakeDefaultsHint from '$lib/components/onboarding/IntakeDefaultsHint.svelte';
	import type { IntakeErrors } from '$lib/logic/onboardingValidation';
	import { errDescribedBy, intakeErrDomId } from '$lib/logic/intakeUi';
	import { onboarding, persistOnboarding } from '$lib/stores/healthApp';
	import type { OnboardingState } from '$lib/types/planV2';

	interface Props {
		fieldErrors: IntakeErrors;
		onUseDefaults: () => void;
	}
	let { fieldErrors, onUseDefaults }: Props = $props();

	function patchSupplements(p: Partial<OnboardingState['supplements']>) {
		persistOnboarding({ ...$onboarding, supplements: { ...$onboarding.supplements, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<label class="field">
		<span class="mono-caps lab">Supplements you already have</span>
		<textarea
			class="inp ta"
			rows="3"
			placeholder="List what you take or own"
			value={$onboarding.supplements.owned}
			oninput={(e) => patchSupplements({ owned: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
	<fieldset class="fs">
		<legend class="mono-caps lab" id="supp-budget-legend">Supplement budget</legend>
		<div
			class="pick-grid tight"
			role="radiogroup"
			aria-labelledby="supp-budget-legend"
			aria-invalid={Boolean(fieldErrors['supplements.budget'])}
			aria-describedby={errDescribedBy(fieldErrors, 'supplements.budget')}
		>
			<button
				type="button"
				class="pick"
				role="radio"
				aria-checked={$onboarding.supplements.budget === 'have'}
				data-on={$onboarding.supplements.budget === 'have'}
				onclick={() => patchSupplements({ budget: 'have' })}
			>
				<span class="pt">Have what I need</span>
			</button>
			<button
				type="button"
				class="pick"
				role="radio"
				aria-checked={$onboarding.supplements.budget === 'budget_2040'}
				data-on={$onboarding.supplements.budget === 'budget_2040'}
				onclick={() => patchSupplements({ budget: 'budget_2040' })}
			>
				<span class="pt">Budget</span>
				<span class="ps">~$20–40/mo</span>
			</button>
			<button
				type="button"
				class="pick"
				role="radio"
				aria-checked={$onboarding.supplements.budget === 'mid_4080'}
				data-on={$onboarding.supplements.budget === 'mid_4080'}
				onclick={() => patchSupplements({ budget: 'mid_4080' })}
			>
				<span class="pt">Mid-range</span>
				<span class="ps">~$40–80/mo</span>
			</button>
			<button
				type="button"
				class="pick"
				role="radio"
				aria-checked={$onboarding.supplements.budget === 'no_limit'}
				data-on={$onboarding.supplements.budget === 'no_limit'}
				onclick={() => patchSupplements({ budget: 'no_limit' })}
			>
				<span class="pt">No limit</span>
			</button>
		</div>
		{#if fieldErrors['supplements.budget']}
			<span id={intakeErrDomId('supplements.budget')} class="field-msg"
				>{fieldErrors['supplements.budget']}</span
			>
		{/if}
	</fieldset>
	<label class="field">
		<span class="mono-caps lab">Other supplements <span class="opt">optional</span></span>
		<textarea
			class="inp ta"
			rows="2"
			value={$onboarding.supplements.other}
			oninput={(e) => patchSupplements({ other: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
</div>
