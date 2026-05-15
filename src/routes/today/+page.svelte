<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import MetricRing from '$lib/components/spec/MetricRing.svelte';
	import MetricTile from '$lib/components/spec/MetricTile.svelte';
	import NextActionCard from '$lib/components/spec/NextActionCard.svelte';
	import PhaseRow from '$lib/components/spec/PhaseRow.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SegmentedControl from '$lib/components/spec/SegmentedControl.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import TimelineCard from '$lib/components/spec/TimelineCard.svelte';
	import { consumedTotalsForToday, waterLitersForDay } from '$lib/logic/dayTotals';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { getMealSlotState } from '$lib/logic/mealSlots';
	import {
		formatTimeFromHHMM,
		getMealsForDay,
		getPhaseLabel,
		getTrainingDay,
		getUserName,
		greeting
	} from '$lib/logic/planDerive';
	import {
		activeDayType,
		onboarding,
		persistActiveDayType,
		persistProgress,
		plan,
		progress,
		settings
	} from '$lib/stores/healthApp';
	import type { DayType } from '$lib/types/planV2';
	import { get } from 'svelte/store';

	let phaseIndex = $state(0);

	const logDay = $derived(logicalDateKey(new Date(), $settings));
	const dayT = $derived($activeDayType as DayType);

	const phaseCount = $derived($plan && Array.isArray($plan.phases) ? $plan.phases.length : 1);

	const totals = $derived(consumedTotalsForToday($plan, dayT, phaseIndex, $progress, $settings));
	const meals = $derived(getMealsForDay($plan, dayT));

	const waterTarget = 3;
	const waterL = $derived(waterLitersForDay($progress, totals.day));

	const calProg = $derived(
		totals.targets.kcal > 0 ? Math.min(1, totals.kcal / totals.targets.kcal) : 0
	);

	const timeline = $derived.by(() => {
		const items: {
			time: string;
			title: string;
			subtitle: string;
			state: 'done' | 'next' | 'upcoming';
		}[] = [];
		let pendingIdx = -1;
		for (let i = 0; i < meals.length; i++) {
			const st = getMealSlotState($progress, logDay, dayT, meals[i].slot);
			if (pendingIdx < 0 && st === 'pending') pendingIdx = i;
		}
		for (let i = 0; i < meals.length; i++) {
			const m = meals[i];
			const st = getMealSlotState($progress, logDay, dayT, m.slot);
			let state: 'done' | 'next' | 'upcoming' = 'upcoming';
			if (st === 'logged') state = 'done';
			else if (i === pendingIdx) state = 'next';
			items.push({
				time: m.time,
				title: `Meal ${m.slot}`,
				subtitle: m.name,
				state
			});
		}
		const td = getTrainingDay($plan, 0);
		const trainTime = formatTimeFromHHMM($onboarding.lifestyle.training_time) ?? '10:00 PM';
		if (td && typeof td.name === 'string' && dayT === 'workout') {
			items.push({
				time: trainTime,
				title: 'Train',
				subtitle: String(td.name),
				state: pendingIdx < 0 ? 'next' : 'upcoming'
			});
		}
		return items.length
			? items
			: [
					{
						time: '—',
						title: 'No schedule',
						subtitle: 'Add meals in your plan',
						state: 'next' as const
					}
				];
	});

	const nextTitle = $derived.by(() => {
		const td = getTrainingDay($plan, 0);
		if (dayT === 'workout' && td && typeof td.name === 'string') return String(td.name);
		return 'Recovery day';
	});

	function bumpWater(delta: number) {
		const cur = get(progress);
		const key = logicalDateKey(new Date(), get(settings));
		const prev = waterLitersForDay(cur, key);
		const next = Math.max(0, Math.round((prev + delta) * 100) / 100);
		persistProgress({
			...cur,
			waterLitersByDay: { ...(cur.waterLitersByDay ?? {}), [key]: next }
		});
	}

	$effect(() => {
		if (!browser) return;
		if (!$plan) goto(resolve('/import'));
	});
</script>

{#if $plan}
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="TODAY" subtitle="{greeting()}, {getUserName($plan)}">
			{#snippet right()}
				<a
					class="icon-header-btn"
					href={resolve('/system/settings')}
					aria-label="Day and app settings"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							stroke="currentColor"
							stroke-width="1.6"
						/>
						<path
							d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.54V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.54 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.54-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.54-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.54V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.54 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c0 .66.39 1.26 1 1.54H21a2 2 0 1 1 0 4h-.09c-.61.28-1 .88-1 1.54Z"
							stroke="currentColor"
							stroke-width="1.2"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			{/snippet}
		</ScreenHeaderBlock>

		<PhaseRow
			label={getPhaseLabel($plan, phaseIndex)}
			{phaseCount}
			{phaseIndex}
			onPhaseChange={(i) => (phaseIndex = i)}
		/>

		<SegmentedControl
			options={[
				{ label: 'Workout Day', value: 'workout' },
				{ label: 'Rest Day', value: 'rest' }
			]}
			selected={$activeDayType}
			onSelect={(v) => persistActiveDayType(v as DayType)}
		/>

		<NextActionCard
			eyebrow="NEXT ACTION"
			title={nextTitle}
			subtitle={dayT === 'workout' ? 'Start your workout' : 'Focus on recovery'}
			onclick={() => goto(resolve('/train'))}
		/>

		<SectionLabel text="MACROS" />

		<div class="rings">
			<MetricRing
				value={Math.min(totals.protein, totals.targets.protein)}
				max={Math.max(1, totals.targets.protein)}
				unit="g"
				label="Protein"
			/>
			<MetricRing
				value={Math.min(totals.carbs, totals.targets.carbs)}
				max={Math.max(1, totals.targets.carbs)}
				unit="g"
				label="Carbs"
			/>
			<MetricRing
				value={Math.min(totals.fat, totals.targets.fat)}
				max={Math.max(1, totals.targets.fat)}
				unit="g"
				label="Fat"
			/>
		</div>

		<div class="tiles">
			<div class="tile-wrap">
				<MetricTile
					label="WATER"
					value={`${waterL.toFixed(2)} / ${waterTarget.toFixed(1)} L`}
					subvalue={`${Math.round((waterL / waterTarget) * 100)}%`}
					progress={waterL / waterTarget}
				/>
				<div class="water-actions">
					<button type="button" class="mini pressable" onclick={() => bumpWater(-0.25)}>−</button>
					<button type="button" class="mini pressable" onclick={() => bumpWater(0.25)}>+</button>
				</div>
			</div>
			<MetricTile
				label="CALORIES"
				value={totals.kcal > 0 ? `${Math.round(totals.kcal).toLocaleString()}` : '—'}
				subvalue={totals.targets.kcal > 0
					? `/ ${Math.round(totals.targets.kcal).toLocaleString()} kcal`
					: ''}
				progress={calProg}
			/>
		</div>

		<SectionLabel text="TIMELINE" />
		<TimelineCard items={timeline} />
	</main>
{/if}

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.rings {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: var(--space-4);
	}

	.tile-wrap {
		position: relative;
	}

	.water-actions {
		position: absolute;
		right: 8px;
		bottom: 10px;
		display: flex;
		gap: 6px;
	}

	.mini {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: rgba(0, 0, 0, 0.35);
		color: var(--text-1);
		font-weight: 800;
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
	}

	@supports (corner-shape: squircle) {
		.mini {
			corner-shape: squircle;
		}
	}
</style>
