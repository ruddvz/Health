<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import PlanWarningsCard from '$lib/components/spec/PlanWarningsCard.svelte';
	import PrivacySafetyCard from '$lib/components/spec/PrivacySafetyCard.svelte';
	import QuickNavGrid from '$lib/components/spec/QuickNavGrid.svelte';
	import MetricRing from '$lib/components/spec/MetricRing.svelte';
	import MetricTile from '$lib/components/spec/MetricTile.svelte';
	import NextActionCard from '$lib/components/spec/NextActionCard.svelte';
	import PhaseRow from '$lib/components/spec/PhaseRow.svelte';
	import AppHeader from '$lib/components/app/AppHeader.svelte';
	import SegmentedControl from '$lib/components/spec/SegmentedControl.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import TimelineCard from '$lib/components/spec/TimelineCard.svelte';
	import { consumedTotalsForToday, waterLitersForDay } from '$lib/logic/dayTotals';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { getMealSlotState } from '$lib/logic/mealSlots';
	import { collectPlanWarnings } from '$lib/logic/planWarnings';
	import {
		formatTimeFromHHMM,
		getMealsForDay,
		getPhaseIndex,
		getPhaseLabel,
		getTrainingDay,
		getUserName,
		getWaterTargetLiters,
		greeting
	} from '$lib/logic/planDerive';
	import {
		activeDayType,
		importWarnings,
		onboarding,
		persistActiveDayType,
		persistOnboarding,
		persistProgress,
		persistSettings,
		plan,
		progress,
		settings
	} from '$lib/stores/healthApp';
	import type { DayType } from '$lib/types/planV2';
	import { get } from 'svelte/store';

	const phaseIndex = $derived(getPhaseIndex($settings));
	const phaseCount = $derived($plan && Array.isArray($plan.phases) ? $plan.phases.length : 1);

	const logDay = $derived(logicalDateKey(new Date(), $settings));
	const dayT = $derived($activeDayType as DayType);

	const totals = $derived(consumedTotalsForToday($plan, dayT, phaseIndex, $progress, $settings));
	const meals = $derived(getMealsForDay($plan, dayT));

	const waterTarget = $derived(getWaterTargetLiters($plan, phaseIndex));
	const waterL = $derived(waterLitersForDay($progress, totals.day));
	const planWarnings = $derived.by(() => {
		const imp = $importWarnings.filter(Boolean);
		const live = $plan ? collectPlanWarnings($plan) : [];
		return [...new Set([...imp, ...live])];
	});

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

	const nextAction = $derived.by(() => {
		for (let i = 0; i < meals.length; i++) {
			const m = meals[i];
			const st = getMealSlotState($progress, logDay, dayT, m.slot);
			if (st === 'pending') {
				return {
					title: m.name,
					subtitle: m.time ? `Meal ${m.slot} · ${m.time}` : `Meal ${m.slot}`,
					href: '/meals' as const
				};
			}
		}
		const td = getTrainingDay($plan, 0);
		if (dayT === 'workout' && td && typeof td.name === 'string') {
			return { title: String(td.name), subtitle: 'Start your workout', href: '/train' as const };
		}
		if (meals[0]) {
			return { title: meals[0].name, subtitle: 'Next meal on your plan', href: '/meals' as const };
		}
		return { title: 'Recovery day', subtitle: 'Focus on recovery', href: '/train' as const };
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

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}
</script>

<main class="screen stack">
	{#if !$plan}
		<AppHeader
			title="Today"
			subtitle="Your daily command center"
			pageLabel="Today"
			planState="none"
		/>

		<EmptyState
			eyebrow="Get started"
			title="Build your daily command center"
			body="Import a plan and Today will show your next meal, workout, water, macros, reminders, and safety checks."
		>
			{#snippet preview()}
				<div class="preview-card">
					<p class="pc-label">Next meal</p>
					<p class="pc-val">—</p>
				</div>
				<div class="preview-card">
					<p class="pc-label">Macros</p>
					<p class="pc-val">—</p>
				</div>
				<div class="preview-card">
					<p class="pc-label">Workout</p>
					<p class="pc-val">—</p>
				</div>
				<div class="preview-card">
					<p class="pc-label">Plan checks</p>
					<p class="pc-val">—</p>
				</div>
			{/snippet}
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	{:else}
		<AppHeader
			title={greeting()}
			subtitle="{getUserName($plan)} · {$activeDayType === 'workout' ? 'Workout day' : 'Rest day'}"
			pageLabel="Today"
			planState="loaded"
			rightAction="settings"
		/>

		<PhaseRow
			label={getPhaseLabel($plan, phaseIndex)}
			{phaseCount}
			{phaseIndex}
			onPhaseChange={(i) => persistSettings({ ...$settings, phaseIndex: i })}
		/>

		<PlanWarningsCard warnings={planWarnings} />

		<SegmentedControl
			options={[
				{ label: 'Workout Day', value: 'workout' },
				{ label: 'Rest Day', value: 'rest' }
			]}
			selected={$activeDayType}
			onSelect={(v) => persistActiveDayType(v as DayType)}
		/>

		<NextActionCard
			eyebrow="UP NEXT"
			title={nextAction.title}
			subtitle={nextAction.subtitle}
			onclick={() => goto(resolve(nextAction.href))}
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

		<QuickNavGrid />

		<PrivacySafetyCard />

		<SectionLabel text="TIMELINE" />
		<TimelineCard items={timeline} />
	{/if}
</main>

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
