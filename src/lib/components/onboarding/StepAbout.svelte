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

	function patchProfile(p: Partial<OnboardingState['profile']>) {
		persistOnboarding({ ...$onboarding, profile: { ...$onboarding.profile, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<label class="field">
		<span class="mono-caps lab">Name</span>
		<input
			class="inp"
			type="text"
			autocomplete="name"
			aria-invalid={Boolean(fieldErrors['profile.name'])}
			aria-describedby={errDescribedBy(fieldErrors, 'profile.name')}
			value={$onboarding.profile.name}
			oninput={(e) => patchProfile({ name: (e.target as HTMLInputElement).value })}
		/>
		{#if fieldErrors['profile.name']}
			<span id={intakeErrDomId('profile.name')} class="field-msg">{fieldErrors['profile.name']}</span>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Age</span>
		<input
			class="inp"
			type="number"
			min="16"
			max="80"
			aria-invalid={Boolean(fieldErrors['profile.age'])}
			aria-describedby={errDescribedBy(fieldErrors, 'profile.age')}
			value={$onboarding.profile.age}
			oninput={(e) => patchProfile({ age: (e.target as HTMLInputElement).value })}
		/>
		{#if fieldErrors['profile.age']}
			<span id={intakeErrDomId('profile.age')} class="field-msg">{fieldErrors['profile.age']}</span>
		{/if}
	</label>
	<label class="field">
		<span class="mono-caps lab">Sex</span>
		<select
			class="inp"
			aria-invalid={Boolean(fieldErrors['profile.sex'])}
			aria-describedby={errDescribedBy(fieldErrors, 'profile.sex')}
			value={$onboarding.profile.sex}
			onchange={(e) => patchProfile({ sex: (e.target as HTMLSelectElement).value })}
		>
			<option value="">Select</option>
			<option value="female">Female</option>
			<option value="male">Male</option>
			<option value="other">Other</option>
		</select>
		{#if fieldErrors['profile.sex']}
			<span id={intakeErrDomId('profile.sex')} class="field-msg">{fieldErrors['profile.sex']}</span>
		{/if}
	</label>
	<div class="field">
		<span class="mono-caps lab">Height</span>
		<div class="seg" role="group" aria-label="Height unit">
			<button
				type="button"
				class="seg-btn"
				aria-pressed={$onboarding.profile.height_unit === 'cm'}
				data-on={$onboarding.profile.height_unit === 'cm'}
				onclick={() => patchProfile({ height_unit: 'cm' })}>cm</button
			>
			<button
				type="button"
				class="seg-btn"
				aria-pressed={$onboarding.profile.height_unit === 'ftin'}
				data-on={$onboarding.profile.height_unit === 'ftin'}
				onclick={() => patchProfile({ height_unit: 'ftin' })}>ft / in</button
			>
		</div>
		{#if $onboarding.profile.height_unit === 'cm'}
			<input
				class="inp mt"
				type="number"
				min="120"
				max="250"
				placeholder="e.g. 175"
				aria-invalid={Boolean(fieldErrors['profile.height'])}
				aria-describedby={errDescribedBy(fieldErrors, 'profile.height')}
				value={$onboarding.profile.height_cm}
				oninput={(e) => patchProfile({ height_cm: (e.target as HTMLInputElement).value })}
			/>
		{:else}
			<div class="row2 mt">
				<input
					class="inp"
					type="number"
					min="3"
					max="8"
					placeholder="ft"
					aria-label="Feet"
					aria-invalid={Boolean(fieldErrors['profile.height'])}
					aria-describedby={errDescribedBy(fieldErrors, 'profile.height')}
					value={$onboarding.profile.height_ft}
					oninput={(e) => patchProfile({ height_ft: (e.target as HTMLInputElement).value })}
				/>
				<input
					class="inp"
					type="number"
					min="0"
					max="11"
					placeholder="in"
					aria-label="Inches"
					aria-invalid={Boolean(fieldErrors['profile.height'])}
					aria-describedby={errDescribedBy(fieldErrors, 'profile.height')}
					value={$onboarding.profile.height_in}
					oninput={(e) => patchProfile({ height_in: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}
		{#if fieldErrors['profile.height']}
			<span id={intakeErrDomId('profile.height')} class="field-msg">{fieldErrors['profile.height']}</span
			>
		{/if}
	</div>
	<div class="field">
		<span class="mono-caps lab">Weight</span>
		<div class="seg" role="group" aria-label="Weight unit">
			<button
				type="button"
				class="seg-btn"
				aria-pressed={$onboarding.profile.weight_unit === 'kg'}
				data-on={$onboarding.profile.weight_unit === 'kg'}
				onclick={() => patchProfile({ weight_unit: 'kg' })}>kg</button
			>
			<button
				type="button"
				class="seg-btn"
				aria-pressed={$onboarding.profile.weight_unit === 'lbs'}
				data-on={$onboarding.profile.weight_unit === 'lbs'}
				onclick={() => patchProfile({ weight_unit: 'lbs' })}>lbs</button
			>
		</div>
		{#if $onboarding.profile.weight_unit === 'kg'}
			<input
				class="inp mt"
				type="number"
				min="1"
				step="0.1"
				aria-invalid={Boolean(fieldErrors['profile.weight'])}
				aria-describedby={errDescribedBy(fieldErrors, 'profile.weight')}
				value={$onboarding.profile.weight_kg}
				oninput={(e) => patchProfile({ weight_kg: (e.target as HTMLInputElement).value })}
			/>
		{:else}
			<input
				class="inp mt"
				type="number"
				min="1"
				step="0.1"
				aria-invalid={Boolean(fieldErrors['profile.weight'])}
				aria-describedby={errDescribedBy(fieldErrors, 'profile.weight')}
				value={$onboarding.profile.weight_lbs}
				oninput={(e) => patchProfile({ weight_lbs: (e.target as HTMLInputElement).value })}
			/>
		{/if}
		{#if fieldErrors['profile.weight']}
			<span id={intakeErrDomId('profile.weight')} class="field-msg">{fieldErrors['profile.weight']}</span
			>
		{/if}
	</div>
	<label class="field">
		<span class="mono-caps lab">Body fat % <span class="opt">optional</span></span>
		<input
			class="inp"
			type="number"
			min="0"
			max="60"
			step="0.1"
			placeholder="Skip if unsure"
			value={$onboarding.profile.body_fat_pct}
			oninput={(e) => patchProfile({ body_fat_pct: (e.target as HTMLInputElement).value })}
		/>
	</label>
</div>
