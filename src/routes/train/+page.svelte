<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ExerciseRow from '$lib/components/spec/ExerciseRow.svelte';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import WorkoutHeroCard from '$lib/components/spec/WorkoutHeroCard.svelte';
	import { getTrainingDay } from '$lib/logic/planDerive';
	import { liftStatsFromSessions, recentSessions } from '$lib/logic/workoutHistory';
	import {
		activeDayType,
		onboarding,
		persistOnboarding,
		plan,
		progress
	} from '$lib/stores/healthApp';
	import { get } from 'svelte/store';

	const day = $derived(getTrainingDay($plan, 0));
	const exercises = $derived.by(() => {
		const ex = day?.exercises;
		return Array.isArray(ex) ? ex : [];
	});

	const weeklySplit = $derived.by(() => {
		const split = ($plan?.training as Record<string, unknown> | undefined)?.weekly_split;
		if (!Array.isArray(split)) return [];
		return split.map((d, i) => {
			const row = (d || {}) as Record<string, unknown>;
			return { index: i, name: String(row.name ?? `Day ${i + 1}`), isToday: i === 0 };
		});
	});

	const sessions = $derived(recentSessions($progress, 5));
	const liftStats = $derived(liftStatsFromSessions(recentSessions($progress, 12)));

	function fmtShort(iso: string) {
		const t = Date.parse(iso);
		if (!Number.isFinite(t)) return iso;
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(t));
	}

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}
</script>

{#if !$plan}
	<main class="screen page-stack">
		<ScreenHeaderBlock title="Training" subtitle="Workouts from your plan" />
		<EmptyState
			title="Training unlocks with your plan"
			body="Import a plan to see today's workout, log sets, use rest timers, and track history."
		>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	</main>
{:else}
	<main class="screen page-stack">
		<ScreenHeaderBlock title="Training" subtitle="Today's session" />

		<div class="page-grid train-grid">
			<div class="train-main page-stack">
				{#if day}
					<WorkoutHeroCard
						title={String(day.name ?? 'Workout')}
						tag={$activeDayType === 'workout' ? 'Workout day' : 'Rest day'}
						duration={`${typeof day.duration_minutes === 'number' ? day.duration_minutes : 45}–${typeof day.duration_minutes === 'number' ? day.duration_minutes + 15 : 60} min`}
						description={`${exercises.length} exercises · from your plan`}
					/>

					<HealthButton
						variant="primary"
						size="lg"
						block
						onclick={() => goto(resolve('/train/session'))}
					>
						Start workout
					</HealthButton>

					<SectionLabel text="Exercises" rightText={`${exercises.length} total`} />

					{#each exercises as ex, i (i)}
						{@const e = ex as Record<string, unknown>}
						<ExerciseRow
							index={i + 1}
							name={String(e.name ?? 'Exercise')}
							setsReps={`${e.sets ?? '?'} sets × ${e.reps ?? '?'} reps`}
							rest={`${e.rest_seconds ?? '—'}s rest`}
						/>
					{/each}

					{#if weeklySplit.length}
						<SectionLabel text="Weekly split" />
						<div class="split-strip">
							{#each weeklySplit as d (d.index)}
								<div class="split-day" class:split-day--today={d.isToday}>
									<span class="split-day__name">{d.name}</span>
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<section class="card rest-card">
						<h2>Recovery day</h2>
						<p>
							No workout scheduled today. Focus on mobility, walking, and sleep. Your plan may
							schedule training on other days.
						</p>
						{#if weeklySplit.length}
							<div class="split-strip">
								{#each weeklySplit as d (d.index)}
									<div class="split-day" class:split-day--today={d.isToday}>
										<span class="split-day__name">{d.name}</span>
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/if}
			</div>

			<aside class="train-rail page-stack">
				<section class="card safety-note">
					<p>
						Review training changes with a qualified professional if you have injuries, pain, or
						medical conditions.
					</p>
				</section>

				{#if sessions.length}
					<SectionLabel text="Recent sessions" />
					<ul class="list card">
						{#each sessions as s (s.id)}
							<li class="row">
								<p class="row__time">{fmtShort(s.finishedAt)}</p>
								<p class="row__body">{s.exercises.length} exercises logged</p>
							</li>
						{/each}
					</ul>
				{/if}

				{#if liftStats.length}
					<SectionLabel text="Last logged weights" />
					<div class="lift card">
						{#each liftStats as ls (ls.name)}
							<div class="lr">
								<p class="nm">{ls.name}</p>
								<p class="vals">
									Last {ls.lastKg !== null ? `${ls.lastKg} kg` : '—'} · Best {ls.bestKg !== null
										? `${ls.bestKg} kg`
										: '—'}
								</p>
							</div>
						{/each}
					</div>
				{/if}
			</aside>
		</div>
	</main>
{/if}

<style>
	.screen {
		flex: 1;
	}

	.split-strip {
		display: flex;
		gap: var(--s-2);
		overflow-x: auto;
		padding-bottom: var(--s-1);
		margin-bottom: var(--phone-card-gap);
	}

	.split-day {
		flex: 0 0 auto;
		min-width: 88px;
		min-height: 56px;
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.split-day--today {
		border-color: var(--h-accent-line);
		background: var(--h-accent-soft);
	}

	.split-day__name {
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
		text-align: center;
	}

	.safety-note p,
	.rest-card p {
		margin: 0;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}

	.rest-card h2 {
		margin: 0 0 var(--s-2);
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--phone-card-gap);
		overflow: hidden;
	}

	.row {
		padding: var(--s-3) var(--s-4);
		border-bottom: 1px solid var(--h-line-soft);
	}

	.row:last-child {
		border-bottom: none;
	}

	.row__time {
		margin: 0;
		font-size: var(--t-caption);
		color: var(--h-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.row__body {
		margin: 4px 0 0;
		font-size: var(--t-callout);
		color: var(--h-text);
	}

	.lift {
		padding: var(--s-3);
		margin-bottom: var(--phone-card-gap);
	}

	.lr {
		padding: var(--s-2) 0;
		border-bottom: 1px solid var(--h-line-soft);
	}

	.lr:last-child {
		border-bottom: none;
	}

	.nm {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: 650;
		color: var(--h-text);
	}

	.vals {
		margin: 4px 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}
</style>
