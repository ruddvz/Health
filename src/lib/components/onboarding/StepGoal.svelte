<script lang="ts">
	import IntakeDefaultsHint from '$lib/components/onboarding/IntakeDefaultsHint.svelte';
	import type { IntakeErrors } from '$lib/logic/onboardingValidation';
	import { errDescribedBy, intakeErrDomId } from '$lib/logic/intakeUi';
	import { onboarding, persistOnboarding } from '$lib/stores/healthApp';
	import type { OnboardingState, PrimaryGoalKey, UrgencyKey } from '$lib/types/planV2';

	interface Props {
		fieldErrors: IntakeErrors;
		onUseDefaults: () => void;
	}
	let { fieldErrors, onUseDefaults }: Props = $props();

	const goals: { id: PrimaryGoalKey; label: string; hint: string }[] = [
		{ id: 'fat_loss', label: 'Fat loss', hint: 'Trim fat, keep muscle' },
		{ id: 'muscle_gain', label: 'Muscle gain', hint: 'Build size & strength' },
		{ id: 'recomp', label: 'Recomp', hint: 'Slow fat loss + muscle' },
		{ id: 'maintenance', label: 'Maintenance', hint: 'Stay steady' }
	];

	const urgencies: { id: UrgencyKey; label: string }[] = [
		{ id: 'sustainable', label: 'Slow' },
		{ id: 'balanced', label: 'Balanced' },
		{ id: 'aggressive', label: 'Aggressive' }
	];

	function patchGoal(p: Partial<OnboardingState['goal']>) {
		persistOnboarding({ ...$onboarding, goal: { ...$onboarding.goal, ...p } });
	}
</script>

<div class="form nothing-surface">
	<IntakeDefaultsHint {onUseDefaults} />
	<fieldset class="fs">
		<legend class="mono-caps lab" id="goal-legend">Primary goal</legend>
		<div
			class="pick-grid"
			role="radiogroup"
			aria-labelledby="goal-legend"
			aria-invalid={Boolean(fieldErrors['goal.primary_goal'])}
			aria-describedby={errDescribedBy(fieldErrors, 'goal.primary_goal')}
		>
			{#each goals as g (g.id)}
				<button
					type="button"
					class="pick"
					role="radio"
					aria-checked={$onboarding.goal.primary_goal === g.id}
					data-on={$onboarding.goal.primary_goal === g.id}
					onclick={() => patchGoal({ primary_goal: g.id })}
				>
					<span class="pt">{g.label}</span>
					<span class="ps">{g.hint}</span>
				</button>
			{/each}
		</div>
		{#if fieldErrors['goal.primary_goal']}
			<span id={intakeErrDomId('goal.primary_goal')} class="field-msg"
				>{fieldErrors['goal.primary_goal']}</span
			>
		{/if}
	</fieldset>
	<p class="mono-caps lab mt2" id="timeline-legend">Program length</p>
	<div
		class="seg"
		role="radiogroup"
		aria-labelledby="timeline-legend"
		aria-invalid={Boolean(fieldErrors['goal.timeline_weeks'])}
		aria-describedby={errDescribedBy(fieldErrors, 'goal.timeline_weeks')}
	>
		{#each ['8', '12', '16', '20'] as w (w)}
			<button
				type="button"
				class="seg-btn"
				role="radio"
				aria-checked={$onboarding.goal.timeline_weeks === w}
				data-on={$onboarding.goal.timeline_weeks === w}
				onclick={() =>
					patchGoal({ timeline_weeks: w as OnboardingState['goal']['timeline_weeks'] })}
				>{w} wks</button
			>
		{/each}
	</div>
	{#if fieldErrors['goal.timeline_weeks']}
		<span id={intakeErrDomId('goal.timeline_weeks')} class="field-msg"
			>{fieldErrors['goal.timeline_weeks']}</span
		>
	{/if}
	<label class="field">
		<span class="mono-caps lab">Target weight <span class="opt">optional</span></span>
		<input
			class="inp"
			type="number"
			min="1"
			step="0.1"
			placeholder={`In ${$onboarding.profile.weight_unit}`}
			value={$onboarding.goal.target_weight}
			oninput={(e) => patchGoal({ target_weight: (e.target as HTMLInputElement).value })}
		/>
	</label>
	<p class="mono-caps lab" id="pace-legend">Pace</p>
	<div
		class="seg"
		role="radiogroup"
		aria-labelledby="pace-legend"
		aria-invalid={Boolean(fieldErrors['goal.urgency'])}
		aria-describedby={errDescribedBy(fieldErrors, 'goal.urgency')}
	>
		{#each urgencies as u (u.id)}
			<button
				type="button"
				class="seg-btn"
				role="radio"
				aria-checked={$onboarding.goal.urgency === u.id}
				data-on={$onboarding.goal.urgency === u.id}
				onclick={() => patchGoal({ urgency: u.id })}>{u.label}</button
			>
		{/each}
	</div>
	{#if fieldErrors['goal.urgency']}
		<span id={intakeErrDomId('goal.urgency')} class="field-msg">{fieldErrors['goal.urgency']}</span>
	{/if}
	<label class="field">
		<span class="mono-caps lab">Extra context <span class="opt">optional</span></span>
		<textarea
			class="inp ta"
			rows="3"
			placeholder="Anything else about your goal"
			value={$onboarding.goal.notes}
			oninput={(e) => patchGoal({ notes: (e.target as HTMLTextAreaElement).value })}
		></textarea>
	</label>
</div>
