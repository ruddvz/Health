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
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SegmentedControl from '$lib/components/spec/SegmentedControl.svelte';
	import StatusStrip from '$lib/components/spec/StatusStrip.svelte';
	import TimelineCard from '$lib/components/spec/TimelineCard.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import { ROUTES } from '$lib/appRoutes';
	import { consumedTotalsForToday, waterLitersForDay } from '$lib/logic/dayTotals';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { getMealSlotState } from '$lib/logic/mealSlots';
	import { collectPlanWarnings } from '$lib/logic/planWarnings';
	import {
		formatTimeFromHHMM,
		getMealsForDay,
		getPhaseIndex,
		getPhaseLabel,
		getSupplementSchedule,
		getTrainingDay,
		getWaterTargetLiters
	} from '$lib/logic/planDerive';
	import {
		activeDayType,
		importWarnings,
		onboarding,
		persistActiveDayType,
		persistOnboarding,
		persistProgress,
		plan,
		progress,
		settings
	} from '$lib/stores/healthApp';
	import { securityConfig } from '$lib/stores/healthLock';
	import type { DayType } from '$lib/types/planV2';
	import { get } from 'svelte/store';

	const phaseIndex = $derived(getPhaseIndex($settings));
	const logDay = $derived(logicalDateKey(new Date(), $settings));
	const dayT = $derived($activeDayType as DayType);

	const totals = $derived(consumedTotalsForToday($plan, dayT, phaseIndex, $progress, $settings));
	const meals = $derived(getMealsForDay($plan, dayT));
	const waterTarget = $derived(getWaterTargetLiters($plan, phaseIndex));
	const waterL = $derived(waterLitersForDay($progress, totals.day));
	const supplements = $derived(getSupplementSchedule($plan));

	const planWarnings = $derived.by(() => {
		const imp = $importWarnings.filter(Boolean);
		const live = $plan ? collectPlanWarnings($plan) : [];
		return [...new Set([...imp, ...live])];
	});

	const calProg = $derived(
		totals.targets.kcal > 0 ? Math.min(1, totals.kcal / totals.targets.kcal) : 0
	);
	const proteinLeft = $derived(Math.max(0, totals.targets.protein - totals.protein));
	const calLeft = $derived(Math.max(0, totals.targets.kcal - totals.kcal));
	const mealsLogged = $derived(
		meals.filter((m) => getMealSlotState($progress, logDay, dayT, m.slot) === 'logged').length
	);
	const adherence = $derived(meals.length ? mealsLogged / meals.length : 0);

	const statusItems = $derived([
		'Local only',
		'Offline ready',
		logDay,
		$securityConfig.enabled ? 'Locked' : 'Open'
	]);

	const subtitle = $derived(
		$plan
			? `${$activeDayType === 'workout' ? 'Workout day' : 'Rest day'} · ${getPhaseLabel($plan, phaseIndex)}`
			: 'Your daily command center'
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
			items.push({ time: m.time, title: `Meal ${m.slot}`, subtitle: m.name, state });
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
			if (getMealSlotState($progress, logDay, dayT, m.slot) === 'pending') {
				return {
					title: m.name,
					subtitle: m.time ? `Meal ${m.slot} · ${m.time}` : `Meal ${m.slot}`,
					detail: m.kcal ? `${m.kcal} kcal · ${m.protein}g protein` : undefined,
					micro: 'Based on your schedule',
					cta: 'Cook next meal',
					href: '/meals' as const
				};
			}
		}
		const td = getTrainingDay($plan, 0);
		if (dayT === 'workout' && td && typeof td.name === 'string') {
			return {
				title: String(td.name),
				subtitle: 'Start your workout',
				detail: undefined,
				micro: 'Based on your schedule',
				cta: 'Start workout',
				href: '/train' as const
			};
		}
		return {
			title: "You're clear for now",
			subtitle: 'Recovery day — focus on rest and hydration',
			detail: undefined,
			micro: undefined,
			cta: 'Open training',
			href: '/train' as const
		};
	});

	function bumpWater(delta: number) {
		const cur = get(progress);
		const key = logicalDateKey(new Date(), get(settings));
		const prev = waterLitersForDay(cur, key);
		persistProgress({
			...cur,
			waterLitersByDay: {
				...(cur.waterLitersByDay ?? {}),
				[key]: Math.max(0, Math.round((prev + delta) * 100) / 100)
			}
		});
	}

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}
</script>

<main class="screen page-stack">
	{#if !$plan}
		<ScreenHeaderBlock title="Today" subtitle="Your daily command center" />
		<EmptyState
			eyebrow="Get started"
			title="Import a plan to unlock Today"
			body="Today shows your next meal, workout, water, macros, reminders, and safety checks."
		>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	{:else}
		<ScreenHeaderBlock title="Today" {subtitle} />
		<StatusStrip items={statusItems} />

		<SegmentedControl
			options={[
				{ label: 'Workout day', value: 'workout' },
				{ label: 'Rest day', value: 'rest' }
			]}
			selected={$activeDayType}
			onSelect={(v) => persistActiveDayType(v as DayType)}
		/>

		<NextActionCard
			eyebrow="Up next"
			title={nextAction.title}
			subtitle={nextAction.subtitle}
			detail={nextAction.detail}
			micro={nextAction.micro}
			ctaLabel={nextAction.cta}
			onclick={() => goto(resolve(nextAction.href))}
		/>

		<div class="metric-grid macro-strip">
			<MetricTile
				label="Protein left"
				value={proteinLeft > 0 ? `${Math.round(proteinLeft)}g` : 'On target'}
				subvalue={`Target ${Math.round(totals.targets.protein)}g`}
				progress={totals.targets.protein > 0 ? totals.protein / totals.targets.protein : 0}
			/>
			<MetricTile
				label="Calories left"
				value={calLeft > 0 ? `${Math.round(calLeft)}` : 'On target'}
				subvalue={totals.targets.kcal > 0 ? `Target ${Math.round(totals.targets.kcal)} kcal` : ''}
				progress={calProg}
			/>
			<MetricTile
				label="Meals done"
				value={`${mealsLogged}/${meals.length}`}
				subvalue="Today's adherence"
				progress={adherence}
			/>
			<div class="tile-wrap card water-card">
				<MetricTile
					label="Water"
					value={`${waterL.toFixed(1)} L`}
					subvalue={`/ ${waterTarget.toFixed(1)} L`}
					progress={waterL / waterTarget}
				/>
				<div class="water-actions">
					<button type="button" class="mini pressable touch-target" onclick={() => bumpWater(-0.25)}
						>−</button
					>
					<button type="button" class="mini pressable touch-target" onclick={() => bumpWater(0.25)}
						>+</button
					>
				</div>
			</div>
		</div>

		<div class="page-grid today-grid">
			<div class="today-left page-stack">
				<TimelineCard items={timeline} />
				{#if planWarnings.length}
					<PlanWarningsCard warnings={planWarnings} />
				{/if}
			</div>

			<aside class="today-right page-stack">
				<div class="rings card">
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

				{#if supplements.length}
					<section class="card compact">
						<h2 class="compact__title">Supplements</h2>
						<p class="compact__sub">{supplements.length} scheduled today</p>
						<HealthButton variant="soft" block href={ROUTES.systemSupplements}
							>View schedule</HealthButton
						>
					</section>
				{/if}

				<QuickNavGrid />
				<PrivacySafetyCard />
			</aside>
		</div>
	{/if}
</main>

<style>
	.screen {
		flex: 1;
	}

	.macro-strip {
		margin-bottom: var(--phone-card-gap);
	}

	.today-grid {
		align-items: start;
	}

	.rings {
		display: flex;
		justify-content: space-around;
		gap: var(--s-2);
		padding: var(--s-4);
	}

	.water-card {
		position: relative;
		padding: 0;
		overflow: visible;
	}

	.water-card :global(.tile) {
		box-shadow: none;
		border: none;
		background: transparent;
	}

	.water-actions {
		position: absolute;
		right: 10px;
		bottom: 12px;
		display: flex;
		gap: 6px;
	}

	.mini {
		width: 44px;
		height: 44px;
		border-radius: var(--r-xs);
		border: 1px solid var(--h-line-strong);
		background: var(--h-surface-3);
		color: var(--h-text);
		font-weight: 760;
		font-size: 18px;
		cursor: pointer;
	}

	.compact__title {
		margin: 0 0 var(--s-2);
		font-size: var(--t-body-lg);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.compact__sub {
		margin: 0 0 var(--s-3);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	@media (max-width: 767px) {
		.today-grid {
			display: flex;
			flex-direction: column;
		}
	}
</style>
