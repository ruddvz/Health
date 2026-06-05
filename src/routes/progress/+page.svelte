<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AdherenceCard from '$lib/components/spec/AdherenceCard.svelte';
	import ChartCard from '$lib/components/spec/ChartCard.svelte';
	import CheckinCard from '$lib/components/spec/CheckinCard.svelte';
	import ChipRow from '$lib/components/spec/ChipRow.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import { adherenceBars7d } from '$lib/logic/adherenceDerive';
	import { logicalDateKey } from '$lib/logic/dateKey';
	import { newId } from '$lib/logic/id';
	import { downloadProgressJson } from '$lib/logic/exportProgress';
	import { buildWeightChartModel } from '$lib/logic/weightSeries';
	import { liftStatsFromSessions, recentSessions } from '$lib/logic/workoutHistory';
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

	let chip = $state('Overview');
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

	const histSessions = $derived(recentSessions($progress, 12));
	const sessions = $derived(recentSessions($progress, 5));
	const liftStats = $derived(liftStatsFromSessions(histSessions));

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

	function deleteWeightAt(index: number) {
		const cur = get(progress);
		const entries = [...(cur.weightEntries ?? [])];
		const revIndex = entries.length - 1 - index;
		if (revIndex < 0 || revIndex >= entries.length) return;
		entries.splice(revIndex, 1);
		persistProgress({ ...cur, weightEntries: entries });
	}

	function deleteCheckin(id: string) {
		const cur = get(progress);
		persistProgress({
			...cur,
			weeklyCheckins: (cur.weeklyCheckins ?? []).filter((c) => c.id !== id)
		});
	}

	function exportProgress() {
		downloadProgressJson(get(progress));
	}

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

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="PROGRESS" />

	{#if !$plan}
		<p class="plan-note nothing-surface" role="status">
			No plan loaded — you can still log weight, waist, and check-ins locally. Import a plan for
			richer adherence insights and plan-aware warnings.
			<button type="button" class="link pressable" onclick={startIntake}>Create plan prompt</button>
			or
			<a class="link" href={resolve('/import')}>import JSON</a>.
		</p>
	{/if}

	<div class="actions">
		<button type="button" class="export-btn pressable" onclick={exportProgress}
			>Export progress JSON</button
		>
	</div>

	<p class="insight nothing-surface" role="note">{insightLine}</p>

	<ChipRow chips={['Overview', 'Trends', 'Metrics']} selected={chip} onSelect={(c) => (chip = c)} />

	{#if chip === 'Overview'}
		<ChartCard
			title="WEIGHT TREND"
			value={chart.valueLabel}
			delta={chart.deltaLabel}
			labels={chart.labels}
			series={chart.series}
		/>

		<AdherenceCard
			title="ADHERENCE"
			value={`${adherencePct}%`}
			subtitle="7 day blend (water · training · check-ins)"
			{bars}
		/>

		<SectionLabel text="RECENT WORKOUTS" />
		{#if sessions.length === 0}
			<p class="empty">Finish a session from Train to build history here.</p>
		{:else}
			<ul class="list nothing-surface">
				{#each sessions as s (s.id)}
					<li class="row">
						<p class="mono-caps t">{fmtShort(s.finishedAt)}</p>
						<p class="b">{s.exercises.length} exercises · logged sets</p>
					</li>
				{/each}
			</ul>
		{/if}

		<CheckinCard
			title="WEEKLY CHECK-IN"
			question="How was your week?"
			subtitle="Log weight, waist, energy, sleep, and notes."
			cta="Log Check-in"
			onclick={() => (checkOpen = true)}
		/>
	{:else if chip === 'Trends'}
		<ChartCard
			title="WEIGHT TREND"
			value={chart.valueLabel}
			delta={chart.deltaLabel}
			labels={chart.labels}
			series={chart.series}
		/>
		<AdherenceCard title="ADHERENCE" value={`${adherencePct}%`} subtitle="7 day average" {bars} />
		<SectionLabel text="WEIGHT LOG" />
		{#if ($progress.weightEntries ?? []).length === 0}
			<p class="empty">Log weight in a weekly check-in to build your trend.</p>
		{:else}
			<ul class="list nothing-surface">
				{#each [...($progress.weightEntries ?? [])]
					.reverse()
					.slice(0, 14) as e, i (`${e.date}-${i}`)}
					<li class="row row-actions">
						<div>
							<p class="mono-caps t">{e.date}</p>
							<p class="b">{e.kg} kg</p>
						</div>
						<button
							type="button"
							class="del pressable"
							aria-label="Delete weight entry for {e.date}"
							onclick={() => deleteWeightAt(i)}>Delete</button
						>
					</li>
				{/each}
			</ul>
		{/if}
		<SectionLabel text="CHECK-INS" />
		{#if ($progress.weeklyCheckins ?? []).length === 0}
			<p class="empty">No check-ins yet.</p>
		{:else}
			<ul class="list nothing-surface">
				{#each [...($progress.weeklyCheckins ?? [])].reverse().slice(0, 10) as c (c.id)}
					<li class="row row-actions">
						<div>
							<p class="mono-caps t">{fmtShort(c.date)}</p>
							<p class="b">
								{c.weight_kg ? `${c.weight_kg} kg` : '—'}
								{#if c.waist_cm}· waist {c.waist_cm} cm{/if}
							</p>
						</div>
						<button
							type="button"
							class="del pressable"
							aria-label="Delete check-in"
							onclick={() => deleteCheckin(c.id)}>Delete</button
						>
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<SectionLabel text="TRAINING VOLUME" />
		<p class="stat mono-caps">{histSessions.length} sessions logged</p>
		{#if liftStats.length}
			<SectionLabel text="LAST LOGGED WEIGHTS" />
			<div class="lift nothing-surface">
				{#each liftStats as ls (ls.name)}
					<div class="lr">
						<p class="nm">{ls.name}</p>
						<p class="vals mono-caps">
							Last {ls.lastKg !== null ? `${ls.lastKg} kg` : '—'} · Best {ls.bestKg !== null
								? `${ls.bestKg} kg`
								: '—'}
						</p>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty">Complete a Train session with logged sets to see lift metrics.</p>
		{/if}
		<p class="stat mono-caps">{($progress.weeklyCheckins ?? []).length} weekly entries</p>
	{/if}
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

	.export-btn {
		width: 100%;
		min-height: 44px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-weight: 650;
		font-size: 14px;
		cursor: pointer;
	}

	.insight {
		margin: 0 0 var(--space-4);
		padding: var(--space-3) var(--space-4);
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-2);
		border-radius: var(--radius-md);
	}

	.plan-note {
		margin: 0 0 var(--space-4);
		padding: var(--space-3) var(--space-4);
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
		border-radius: var(--radius-md);
	}

	.link {
		color: var(--accent, var(--ios-blue, var(--text-1)));
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
		border: none;
		background: none;
		padding: 0;
		font-size: inherit;
		cursor: pointer;
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

	.row-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.del {
		flex-shrink: 0;
		padding: 8px 12px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-2);
		background: transparent;
		color: var(--text-3);
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}

	.row:last-child {
		border-bottom: none;
	}

	.t {
		margin: 0;
		font-size: 9px;
		color: var(--text-3);
	}

	.b {
		margin: 6px 0 0;
		font-size: 14px;
		color: var(--text-1);
	}

	.lift {
		padding: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.lr {
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--line-1);
	}

	.lr:last-child {
		border-bottom: none;
	}

	.nm {
		margin: 0;
		font-size: 14px;
		font-weight: 650;
		color: var(--text-1);
	}

	.vals {
		margin: 6px 0 0;
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
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
</style>
