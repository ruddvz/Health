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

	function patchTraining(p: Partial<OnboardingState['training']>) {
		persistOnboarding({ ...$onboarding, training: { ...$onboarding.training, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<label class="field">
		<span class="mono-caps lab">Training days per week</span>
		<input
			class="inp"
			type="number"
			min="1"
			max="7"
			aria-invalid={Boolean(fieldErrors['training.days_per_week'])}
			aria-describedby={errDescribedBy(fieldErrors, 'training.days_per_week')}
			value={$onboarding.training.days_per_week}
			oninput={(e) => patchTraining({ days_per_week: (e.target as HTMLInputElement).value })}
		/>
		{#if fieldErrors['training.days_per_week']}
			<span id={intakeErrDomId('training.days_per_week')} class="field-msg"
				>{fieldErrors['training.days_per_week']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Where you train</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['training.location'])}
			aria-describedby={errDescribedBy(fieldErrors, 'training.location')}
			value={$onboarding.training.location}
			onchange={(e) => patchTraining({ location: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="full_gym">Full gym</option>
			<option value="home_equipment">Home + equipment</option>
			<option value="home_bodyweight">Home bodyweight only</option>
		</select>
		{#if fieldErrors['training.location']}
			<span id={intakeErrDomId('training.location')} class="field-msg"
				>{fieldErrors['training.location']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Fitness level</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['training.fitness_level'])}
			aria-describedby={errDescribedBy(fieldErrors, 'training.fitness_level')}
			value={$onboarding.training.fitness_level}
			onchange={(e) => patchTraining({ fitness_level: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="beginner">Beginner</option>
			<option value="intermediate">Intermediate</option>
			<option value="advanced">Advanced</option>
		</select>
		{#if fieldErrors['training.fitness_level']}
			<span id={intakeErrDomId('training.fitness_level')} class="field-msg"
				>{fieldErrors['training.fitness_level']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Injuries or limitations</span>
		<textarea
			class="inp ta"
			rows="3"
			placeholder="Or leave blank"
			value={$onboarding.training.injuries}
			oninput={(e) => patchTraining({ injuries: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
</div>
