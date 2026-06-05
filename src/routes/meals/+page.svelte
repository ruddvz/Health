<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CookModeSheet from '$lib/components/spec/CookModeSheet.svelte';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import ChipRow from '$lib/components/spec/ChipRow.svelte';
	import MealCard from '$lib/components/spec/MealCard.svelte';
	import QuickFixSheet from '$lib/components/spec/QuickFixSheet.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SecondaryButton from '$lib/components/spec/SecondaryButton.svelte';
	import TargetGapCard from '$lib/components/spec/TargetGapCard.svelte';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { plannedMacrosFromMeals } from '$lib/logic/dayTotals';
	import { getMealSlotState, mealSlotKey } from '$lib/logic/mealSlots';
	import { newId } from '$lib/logic/id';
	import type { QuickFixPreset } from '$lib/logic/quickFixPresets';
	import {
		getEmergencyMeals,
		getMealsForDay,
		getPhaseTargets,
		type MealRowDetail
	} from '$lib/logic/planDerive';
	import {
		activeDayType,
		onboarding,
		persistActiveDayType,
		persistOnboarding,
		persistProgress,
		plan,
		progress,
		settings
	} from '$lib/stores/healthApp';
	import type { DayType, ExtraMeal, MealSlotStatus } from '$lib/types/planV2';
	import { showToast } from '$lib/stores/toast';
	import { get } from 'svelte/store';

	let chip = $state<'Workout Day' | 'Rest Day' | 'All'>('Workout Day');
	let quickFixOpen = $state(false);
	let addOpen = $state(false);
	let emName = $state('');
	let emTime = $state('12:00');
	let emKcal = $state('');
	let emP = $state('');
	let emC = $state('');
	let emF = $state('');
	let cookMeal = $state<MealRowDetail | null>(null);

	const logDay = $derived(logicalDateKey(new Date(), $settings));
	const dayTypeForTrack = $derived<DayType | null>(
		chip === 'Rest Day' ? 'rest' : chip === 'Workout Day' ? 'workout' : null
	);

	const meals = $derived.by(() => {
		if (chip === 'All') {
			const a = getMealsForDay($plan, 'workout');
			const b = getMealsForDay($plan, 'rest');
			return [...a, ...b];
		}
		return getMealsForDay($plan, chip === 'Rest Day' ? 'rest' : 'workout');
	});

	const dayForEmergency = $derived<DayType>(
		chip === 'Rest Day' ? 'rest' : chip === 'Workout Day' ? 'workout' : ($activeDayType as DayType)
	);
	const emergency = $derived(getEmergencyMeals($plan, dayForEmergency));

	const targets = $derived(getPhaseTargets($plan, 0));
	const planned = $derived(plannedMacrosFromMeals(meals, targets));

	const gap = $derived.by(() => {
		const d = targets.kcal - planned.kcal;
		const dp = targets.protein - planned.protein;
		const dc = targets.carbs - planned.carbs;
		if (Math.abs(d) < 80) return null;
		return {
			title: 'TARGET GAP',
			message:
				d > 0
					? 'Template meals run a little light versus phase calories.'
					: 'Template meals run a little heavy versus phase calories.',
			metrics: [
				{
					label: 'Calories',
					value: `${d > 0 ? '' : '+'}${Math.round(d)} kcal`,
					color: 'warning' as const
				},
				{
					label: 'Protein',
					value: `${dp > 0 ? '' : '+'}${Math.round(dp)} g`,
					color: 'warning' as const
				},
				{
					label: 'Carbs',
					value: `${dc > 0 ? '' : '+'}${Math.round(dc)} g`,
					color: 'warning' as const
				}
			]
		};
	});

	function setMealSlot(slot: number, dayType: DayType, s: 'pending' | MealSlotStatus) {
		const cur = get(progress);
		const k = mealSlotKey(logDay, dayType, slot);
		const nextMap = { ...(cur.mealSlotStatus ?? {}) };
		if (s === 'pending') delete nextMap[k];
		else nextMap[k] = s;
		persistProgress({ ...cur, mealSlotStatus: nextMap });
	}

	function onQuickPick(p: QuickFixPreset) {
		const cur = get(progress);
		const item = {
			id: newId(),
			day: logicalDateKey(new Date(), get(settings)),
			label: p.label,
			kcal: p.kcal,
			protein_g: p.protein_g,
			carbs_g: p.carbs_g,
			fat_g: p.fat_g
		};
		persistProgress({ ...cur, quickFixItems: [...(cur.quickFixItems ?? []), item] });
		quickFixOpen = false;
	}

	function saveExtraMeal() {
		const kcal = Number(emKcal);
		if (!Number.isFinite(kcal) || kcal <= 0) return;
		const cur = get(progress);
		const row: ExtraMeal = {
			id: newId(),
			day: logicalDateKey(new Date(), get(settings)),
			name: emName.trim() || 'Snack',
			time: emTime,
			kcal,
			protein_g: emP.trim() ? Number(emP) : undefined,
			carbs_g: emC.trim() ? Number(emC) : undefined,
			fat_g: emF.trim() ? Number(emF) : undefined
		};
		persistProgress({ ...cur, extraMeals: [...(cur.extraMeals ?? []), row] });
		showToast('Meal logged for today', 'success');
		addOpen = false;
		emName = '';
		emKcal = '';
		emP = '';
		emC = '';
		emF = '';
	}

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}

	$effect(() => {
		if (chip === 'Workout Day') persistActiveDayType('workout');
		else if (chip === 'Rest Day') persistActiveDayType('rest');
	});
</script>

{#if !$plan}
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="MEALS" />
		<EmptyState
			title="Meals come from your plan"
			body="Import a Health JSON plan or load the demo sample. Meals will appear here with macros, cook mode, swaps, and logging once a plan is loaded."
		>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	</main>
{:else}
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="MEALS" />

		<ChipRow
			chips={['Workout Day', 'Rest Day', 'All']}
			selected={chip}
			onSelect={(c) => (chip = c as typeof chip)}
		/>

		{#if gap}
			<TargetGapCard
				title={gap.title}
				message={gap.message}
				metrics={gap.metrics}
				cta="Quick Fix"
				onCta={() => (quickFixOpen = true)}
			/>
		{/if}

		{#each meals as m, i (`${chip}-${m.slot}-${i}`)}
			<MealCard
				index={m.slot}
				time={m.time}
				name={m.name}
				kcal={m.kcal}
				protein={m.protein}
				carbs={m.carbs}
				fat={m.fat}
				track={dayTypeForTrack
					? {
							status: getMealSlotState($progress, logDay, dayTypeForTrack, m.slot),
							onChange: (nx) => setMealSlot(m.slot, dayTypeForTrack, nx)
						}
					: undefined}
			/>
			<div class="meal-extra nothing-surface">
				{#if m.swaps.length}
					<details class="swaps">
						<summary class="mono-caps sum">Swaps and alternatives</summary>
						{#each m.swaps as sw (sw.label + sw.text)}
							<p class="swap-row"><span class="mono-caps tag">{sw.label}</span> {sw.text}</p>
						{/each}
					</details>
				{/if}
				<button type="button" class="cook pressable" onclick={() => (cookMeal = m)}
					>Cook mode</button
				>
			</div>
		{/each}

		{#if emergency.length}
			<section class="emerg nothing-surface">
				<p class="mono-caps emerg-t">Backup / busy-day options</p>
				{#each emergency as line, i (i)}
					<p class="emerg-line">{line}</p>
				{/each}
			</section>
		{/if}

		<SecondaryButton label="+ Add Meal" onclick={() => (addOpen = true)} />
	</main>
{/if}

<CookModeSheet open={cookMeal !== null} meal={cookMeal} onClose={() => (cookMeal = null)} />
<QuickFixSheet open={quickFixOpen} onClose={() => (quickFixOpen = false)} onPick={onQuickPick} />

<BottomSheet open={addOpen} title="Add meal" onClose={() => (addOpen = false)}>
	<p class="sub">Logged for today only. Does not edit your imported plan JSON.</p>
	<label class="field-stack">
		<span class="mono-caps">Name</span>
		<input class="inp-shell" type="text" bind:value={emName} placeholder="Post-workout shake" />
	</label>
	<label class="field-stack">
		<span class="mono-caps">Time</span>
		<input class="inp-shell" type="text" bind:value={emTime} placeholder="12:00" />
	</label>
	<label class="field-stack">
		<span class="mono-caps">Calories (required)</span>
		<input class="inp-shell" type="number" min="1" bind:value={emKcal} placeholder="320" />
	</label>
	<div class="row2">
		<label class="field-stack">
			<span class="mono-caps">P (g)</span>
			<input class="inp-shell" type="number" min="0" bind:value={emP} />
		</label>
		<label class="field-stack">
			<span class="mono-caps">C (g)</span>
			<input class="inp-shell" type="number" min="0" bind:value={emC} />
		</label>
		<label class="field-stack">
			<span class="mono-caps">F (g)</span>
			<input class="inp-shell" type="number" min="0" bind:value={emF} />
		</label>
	</div>
	{#snippet footer()}
		<div class="sheet-actions">
			<button type="button" class="sheet-btn pressable" onclick={() => (addOpen = false)}
				>Cancel</button
			>
			<button type="button" class="sheet-btn primary pressable" onclick={saveExtraMeal}>Save</button
			>
		</div>
	{/snippet}
</BottomSheet>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.meal-extra {
		margin: calc(-1 * var(--space-1)) 0 var(--space-3);
		padding: var(--space-2) var(--space-4) var(--space-3);
		border-radius: 0 0 var(--radius-widget) var(--radius-widget);
	}
	.cook {
		width: 100%;
		min-height: 44px;
		margin-top: 8px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-2);
		background: rgba(255, 42, 42, 0.1);
		color: var(--text-1);
		font-weight: 650;
		cursor: pointer;
	}
	.emerg {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
	}
	.emerg-t {
		margin: 0 0 8px;
		font-size: 9px;
		color: var(--warning);
	}
	.emerg-line {
		margin: 0 0 8px;
		font-size: 14px;
		color: var(--text-2);
	}
	.swap-row {
		margin: 8px 0 0;
		font-size: 13px;
		color: var(--text-2);
	}
	.sum {
		font-size: 9px;
		color: var(--text-3);
	}

	.sub {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		color: var(--text-3);
		line-height: 1.45;
	}

	.row2 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
</style>
