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

	function patchDiet(p: Partial<OnboardingState['diet']>) {
		persistOnboarding({ ...$onboarding, diet: { ...$onboarding.diet, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<label class="field">
		<span class="mono-caps lab">Dietary preference</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['diet.preference'])}
			aria-describedby={errDescribedBy(fieldErrors, 'diet.preference')}
			value={$onboarding.diet.preference}
			onchange={(e) => patchDiet({ preference: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="omnivore">Omnivore</option>
			<option value="vegetarian">Vegetarian</option>
			<option value="vegan">Vegan</option>
			<option value="halal">Halal</option>
			<option value="pescatarian">Pescatarian</option>
		</select>
		{#if fieldErrors['diet.preference']}
			<span id={intakeErrDomId('diet.preference')} class="field-msg"
				>{fieldErrors['diet.preference']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Foods you dislike or avoid</span>
		<textarea
			class="inp ta"
			rows="2"
			placeholder="Optional"
			value={$onboarding.diet.food_dislikes}
			oninput={(e) => patchDiet({ food_dislikes: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
	<label class="field">
		<span class="mono-caps lab">Allergies & intolerances</span>
		<textarea
			class="inp ta"
			rows="2"
			placeholder="Or none"
			value={$onboarding.diet.allergies}
			oninput={(e) => patchDiet({ allergies: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
	<label class="field row-inline">
		<input
			type="checkbox"
			checked={$onboarding.diet.medication_warning}
			onchange={(e) => patchDiet({ medication_warning: (e.target as HTMLInputElement).checked })}
		/>
		<span class="lab-inline"
			>I take prescription medication or have a condition to review before supplements.</span
		>
	</label>
	<label class="field">
		<span class="mono-caps lab">Meals per day</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['diet.meals_per_day'])}
			aria-describedby={errDescribedBy(fieldErrors, 'diet.meals_per_day')}
			value={$onboarding.diet.meals_per_day}
			onchange={(e) => patchDiet({ meals_per_day: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="3">3</option>
			<option value="4">4</option>
			<option value="5">5</option>
			<option value="6">6</option>
		</select>
		{#if fieldErrors['diet.meals_per_day']}
			<span id={intakeErrDomId('diet.meals_per_day')} class="field-msg"
				>{fieldErrors['diet.meals_per_day']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Typical cooking time</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['diet.cooking_time'])}
			aria-describedby={errDescribedBy(fieldErrors, 'diet.cooking_time')}
			value={$onboarding.diet.cooking_time}
			onchange={(e) => patchDiet({ cooking_time: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="under_20">Under 20 min</option>
			<option value="30_45">30–45 min</option>
			<option value="enjoy">Enjoy longer cooking</option>
		</select>
		{#if fieldErrors['diet.cooking_time']}
			<span id={intakeErrDomId('diet.cooking_time')} class="field-msg"
				>{fieldErrors['diet.cooking_time']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Meal prep</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['diet.meal_prep'])}
			aria-describedby={errDescribedBy(fieldErrors, 'diet.meal_prep')}
			value={$onboarding.diet.meal_prep}
			onchange={(e) => patchDiet({ meal_prep: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="yes">Yes</option>
			<option value="no">No</option>
		</select>
		{#if fieldErrors['diet.meal_prep']}
			<span id={intakeErrDomId('diet.meal_prep')} class="field-msg"
				>{fieldErrors['diet.meal_prep']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Cooking equipment</span>
		<textarea
			class="inp ta"
			rows="2"
			placeholder="e.g. Instant Pot, air fryer, rice cooker"
			value={$onboarding.diet.equipment}
			oninput={(e) => patchDiet({ equipment: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
</div>
