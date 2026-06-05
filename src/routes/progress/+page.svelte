<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import AdherenceCard from '$lib/components/spec/AdherenceCard.svelte';
	import ChartCard from '$lib/components/spec/ChartCard.svelte';
	import CheckinCard from '$lib/components/spec/CheckinCard.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import { adherenceBars7d } from '$lib/logic/adherenceDerive';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { newId } from '$lib/logic/id';
	import { downloadProgressJson } from '$lib/logic/exportProgress';
	import { buildWeightChartModel } from '$lib/logic/weightSeries';
	import { recentSessions } from '$lib/logic/workoutHistory';
	import {
		onboarding,
		persistOnboarding,
		persistProgress,
		plan,
		progress,
		settings
	} from '$lib/stores/healthApp';
	import type { WeeklyCheckinEntry } from '$lib/types/planV2';
	import { showToast } from '$lib/stores/toast';
	import { get } from 'svelte/store';

	let checkOpen = $state(false);
	let weightKg = $state('');
	let waistCm = $state('');
	let energy = $state('');
	let sleepH = $state('');
	let notes = $state('');

	const chart = $derived(buildWeightChartModel($progress, $settings));
	const bars = $derived(adherenceBars7d($progress, new Date(), $settings));
	const adherencePct = $derived(
		bars.length ? Math.round((bars.reduce((a, b) => a + b, 0) / bars.length) * 100) : 0
	);
	const hasAdherenceData = $derived(bars.some((b) => b > 0));
	const adherenceLabel = $derived(hasAdherenceData ? `${adherencePct}%` : 'Not enough data yet');
	const adherenceSubtitle = $derived(
		hasAdherenceData
			? '7 day blend (water · training · check-ins)'
			: 'Adherence appears after water, training, or check-ins are logged.'
	);

	const sessions = $derived(recentSessions($progress, 5));

	function parseKg(s: string): number | null {
		const v = Number(String(s).replace(',', '.').trim());
		return Number.isFinite(v) ? v : null;
	}

	function saveCheckin() {
		const cur = get(progress);
		const entry: WeeklyCheckinEntry = {
			id: newId(),
			date: new Date().toISOString(),
			weight_kg: weightKg.trim() || undefined,
			waist_cm: waistCm.trim() || undefined,
			energy_1_10: energy.trim() || undefined,
			sleep_hours: sleepH.trim() || undefined,
			notes: notes.trim() || undefined
		};
		const nextCheckins = [...(cur.weeklyCheckins ?? []), entry];
		let weightEntries = [...(cur.weightEntries ?? [])];
		const wn = parseKg(weightKg);
		if (wn !== null) {
			const dk = logicalDateKey(new Date(), get(settings));
			weightEntries = [...weightEntries, { date: dk, kg: wn }];
		}
		persistProgress({ ...cur, weeklyCheckins: nextCheckins, weightEntries });
		showToast('Check-in saved', 'success');
		checkOpen = false;
		weightKg = '';
		waistCm = '';
		energy = '';
		sleepH = '';
		notes = '';
	}

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

	function exportProgress() {
		downloadProgressJson(get(progress));
	}

	const weightEntries = $derived($progress.weightEntries ?? []);
	const latestWeight = $derived(
		weightEntries.length ? weightEntries[weightEntries.length - 1]?.kg : null
	);
	const checkinCount = $derived(($progress.weeklyCheckins ?? []).length);
	const progressSummary = $derived(
		checkinCount > 0
			? `${checkinCount} log${checkinCount === 1 ? '' : 's'} recorded`
			: 'Start logging to see trends'
	);

	const insightLine = $derived.by(() => {
		const entries = $progress.weightEntries ?? [];
		if (entries.length < 2) {
			return 'Log at least two weigh-ins to see a simple trend. This is informational only — not medical advice.';
		}
		const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
		const first = sorted[0]?.kg ?? 0;
		const last = sorted[sorted.length - 1]?.kg ?? 0;
		const delta = Math.round((last - first) * 10) / 10;
		if (Math.abs(delta) < 0.2) {
			return 'Weight has been relatively stable over your logged entries. Trends are approximate and not medical advice.';
		}
		return delta > 0
			? `Weight is up about ${delta} kg from your first to latest logged entry. Use trends as context only — not medical advice.`
			: `Weight is down about ${Math.abs(delta)} kg from your first to latest logged entry. Use trends as context only — not medical advice.`;
	});
</script>

<main class="screen page-stack">
	<ScreenHeaderBlock
		title="Progress"
		subtitle={$plan ? 'Trends and check-ins' : 'Track privately'}
	/>

	{#if !$plan}
		<EmptyState
			title="Track progress privately"
			body="Log weight, waist, energy, sleep, and notes. Import a plan later for richer adherence insights."
		>
			<HealthButton variant="primary" block onclick={() => (checkOpen = true)}>
				Log check-in
			</HealthButton>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	{:else}
		<section class="hero-card progress-hero">
			<p class="hero-eyebrow">{progressSummary}</p>
			<h2 class="hero-value">
				{latestWeight !== null ? `${latestWeight} kg` : 'No weight logged yet'}
			</h2>
			<p class="hero-sub">Keep logging consistently before judging the trend.</p>
		</section>

		<HealthButton variant="primary" size="lg" block onclick={() => (checkOpen = true)}>
			Log check-in
		</HealthButton>
	{/if}

	<ChartCard
		title="Weight trend"
		value={chart.valueLabel}
		delta={chart.deltaLabel}
		labels={chart.labels}
		series={chart.series}
	/>

	<CheckinCard
		title="Weekly check-in"
		question="How was your week?"
		subtitle="Log weight, waist, energy, sleep, and notes."
		cta="Log check-in"
		onclick={() => (checkOpen = true)}
	/>

	<AdherenceCard title="Adherence" value={adherenceLabel} subtitle={adherenceSubtitle} {bars} />

	<p class="insight card" role="note">{insightLine}</p>

	{#if sessions.length}
		<SectionLabel text="Recent workouts" />
		<ul class="list card">
			{#each sessions as s (s.id)}
				<li class="row">
					<p class="t">{fmtShort(s.finishedAt)}</p>
					<p class="b">{s.exercises.length} exercises logged</p>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="actions">
		<HealthButton variant="soft" block onclick={exportProgress}>Export progress JSON</HealthButton>
	</div>
</main>

<BottomSheet open={checkOpen} title="Weekly check-in" onClose={() => (checkOpen = false)}>
	<p class="sub">Stored locally. Weight also feeds the trend chart.</p>
	<label class="field-stack">
		<span class="mono-caps">Weight (kg)</span>
		<input class="inp-shell" type="text" bind:value={weightKg} placeholder="e.g. 74.2" />
	</label>
	<label class="field-stack">
		<span class="mono-caps">Waist (cm)</span>
		<input class="inp-shell" type="text" bind:value={waistCm} placeholder="optional" />
	</label>
	<div class="row2">
		<label class="field-stack">
			<span class="mono-caps">Energy (1–10)</span>
			<input class="inp-shell" type="text" bind:value={energy} placeholder="7" />
		</label>
		<label class="field-stack">
			<span class="mono-caps">Sleep (h)</span>
			<input class="inp-shell" type="text" bind:value={sleepH} placeholder="7.5" />
		</label>
	</div>
	<label class="field-stack">
		<span class="mono-caps">Notes</span>
		<textarea class="ta-shell" rows="3" bind:value={notes} placeholder="Short reflection"
		></textarea>
	</label>
	{#snippet footer()}
		<div class="sheet-actions">
			<button type="button" class="sheet-btn pressable" onclick={() => (checkOpen = false)}
				>Cancel</button
			>
			<button type="button" class="sheet-btn primary pressable" onclick={saveCheckin}>Save</button>
		</div>
	{/snippet}
</BottomSheet>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.actions {
		margin-bottom: var(--space-3);
	}

	.progress-hero {
		padding: var(--s-5);
	}

	.hero-eyebrow {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.hero-value {
		margin: 0 0 var(--s-2);
		font-size: var(--t-large);
		font-weight: 760;
		color: var(--h-text);
		line-height: var(--lh-tight);
	}

	.hero-sub {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.insight {
		margin: 0 0 var(--phone-card-gap);
		padding: var(--s-4);
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.empty,
	.stat {
		margin: 0 0 var(--space-3);
		font-size: 14px;
		color: var(--text-2);
	}

	.stat {
		font-size: 12px;
		color: var(--text-3);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.row {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--line-1);
	}

	.row:last-child {
		border-bottom: none;
	}

	.t {
		margin: 0;
		font-size: var(--t-caption);
		color: var(--h-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.b {
		margin: 4px 0 0;
		font-size: var(--t-callout);
		color: var(--h-text);
	}

	.sub {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		color: var(--text-3);
		line-height: 1.45;
	}

	.row2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
</style>
