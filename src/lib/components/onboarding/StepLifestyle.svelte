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

	function patchLifestyle(p: Partial<OnboardingState['lifestyle']>) {
		persistOnboarding({ ...$onboarding, lifestyle: { ...$onboarding.lifestyle, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<label class="field">
		<span class="mono-caps lab">Country</span>
		<input
			class="inp"
			type="text"
			list="country-list"
			autocomplete="country-name"
			placeholder="e.g. Canada"
			aria-invalid={Boolean(fieldErrors['lifestyle.country'])}
			aria-describedby={errDescribedBy(fieldErrors, 'lifestyle.country')}
			value={$onboarding.lifestyle.country}
			oninput={(e) => patchLifestyle({ country: (e.target as HTMLInputElement).value })}
		/>
		<datalist id="country-list">
			<option value="Canada"></option>
			<option value="United States"></option>
			<option value="United Kingdom"></option>
			<option value="Australia"></option>
			<option value="India"></option>
			<option value="Germany"></option>
			<option value="France"></option>
			<option value="Other"></option>
		</datalist>
		{#if fieldErrors['lifestyle.country']}
			<span id={intakeErrDomId('lifestyle.country')} class="field-msg"
				>{fieldErrors['lifestyle.country']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">City / region <span class="opt">optional</span></span>
		<input
			class="inp"
			type="text"
			value={$onboarding.lifestyle.city}
			oninput={(e) => patchLifestyle({ city: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<label class="field">
		<span class="mono-caps lab">Wake time</span>
		<input
			class="inp"
			type="time"
			value={$onboarding.lifestyle.wake_time}
			oninput={(e) => patchLifestyle({ wake_time: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<label class="field">
		<span class="mono-caps lab">Sleep time</span>
		<input
			class="inp"
			type="time"
			value={$onboarding.lifestyle.sleep_time}
			oninput={(e) => patchLifestyle({ sleep_time: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<label class="field">
		<span class="mono-caps lab">Training time</span>
		<input
			class="inp"
			type="time"
			value={$onboarding.lifestyle.training_time}
			oninput={(e) => patchLifestyle({ training_time: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<label class="field">
		<span class="mono-caps lab">Daily activity outside the gym</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['lifestyle.activity_outside_gym'])}
			aria-describedby={errDescribedBy(fieldErrors, 'lifestyle.activity_outside_gym')}
			value={$onboarding.lifestyle.activity_outside_gym}
			onchange={(e) =>
				patchLifestyle({ activity_outside_gym: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="sedentary">Mostly sedentary</option>
			<option value="light">Light movement</option>
			<option value="active_job">Active job</option>
			<option value="very_active_job">Very active day</option>
		</select>
		{#if fieldErrors['lifestyle.activity_outside_gym']}
			<span id={intakeErrDomId('lifestyle.activity_outside_gym')} class="field-msg"
				>{fieldErrors['lifestyle.activity_outside_gym']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Sleep hours / night</span>
		<input
			class="inp"
			type="number"
			min="4"
			max="12"
			step="0.5"
			value={$onboarding.lifestyle.sleep_hours}
			oninput={(e) => patchLifestyle({ sleep_hours: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<label class="field">
		<span class="mono-caps lab">Stress level</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['lifestyle.stress_level'])}
			aria-describedby={errDescribedBy(fieldErrors, 'lifestyle.stress_level')}
			value={$onboarding.lifestyle.stress_level}
			onchange={(e) => patchLifestyle({ stress_level: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="low">Low</option>
			<option value="moderate">Moderate</option>
			<option value="high">High</option>
			<option value="very_high">Very high</option>
		</select>
		{#if fieldErrors['lifestyle.stress_level']}
			<span id={intakeErrDomId('lifestyle.stress_level')} class="field-msg"
				>{fieldErrors['lifestyle.stress_level']}</span
			>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Biggest challenges</span>
		<textarea
			class="inp ta"
			rows="3"
			placeholder="e.g. night shifts, travel, cravings"
			value={$onboarding.lifestyle.biggest_challenges}
			oninput={(e) =>
				patchLifestyle({ biggest_challenges: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
</div>
<section class="legal nothing-surface">
	<h2 class="mono-caps h">Privacy</h2>
	<p class="p">
		This app does not send your plan to a server. Data lives in your browser storage only.
	</p>
	<h2 class="mono-caps h">Local storage</h2>
	<p class="p">Clearing site data removes your plan unless you exported a backup JSON.</p>
</section>
