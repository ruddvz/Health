<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import ChecklistRow from '$lib/components/spec/ChecklistRow.svelte';
	import ChipRow from '$lib/components/spec/ChipRow.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SecondaryButton from '$lib/components/spec/SecondaryButton.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import { flattenGrocery, getBudgetSwaps } from '$lib/logic/planDerive';
	import { persistProgress, plan, progress } from '$lib/stores/healthApp';
	import { get } from 'svelte/store';

	let chip = $state('All');
	let showBudgetSwaps = $state(false);

	const budgetSwaps = $derived(getBudgetSwaps($plan));

	const grouped = $derived.by(() => {
		const rows = flattenGrocery($plan);
		const byStore: Record<string, typeof rows> = {};
		for (const r of rows) {
			if (chip !== 'All' && chip === 'Store' && r.store !== 'SUPERMARKET') continue;
			if (chip !== 'All' && chip === 'Category') continue;
			if (!byStore[r.store]) byStore[r.store] = [];
			byStore[r.store].push(r);
		}
		return byStore;
	});

	function toggle(key: string) {
		const cur = get(progress);
		const gc = { ...(cur.groceryChecked ?? {}) };
		gc[key] = !gc[key];
		persistProgress({ ...cur, groceryChecked: gc });
	}

	function checked(key: string) {
		return !!get(progress).groceryChecked?.[key];
	}

	$effect(() => {
		if (!browser) return;
		if (!$plan) goto(resolve('/import'));
	});
</script>

{#if $plan}
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="GROCERY" />
		<ChipRow chips={['All', 'Store', 'Category']} selected={chip} onSelect={(c) => (chip = c)} />

		{#if budgetSwaps.length}
			<label class="budget-toggle nothing-surface">
				<input type="checkbox" bind:checked={showBudgetSwaps} />
				<span class="mono-caps">Budget swaps</span>
				<span class="hint">Show lower-cost alternatives from your plan</span>
			</label>
		{/if}

		{#if showBudgetSwaps && budgetSwaps.length}
			<SectionLabel text="BUDGET ALTERNATIVES" />
			{#each budgetSwaps as sw, i (i)}
				<div class="swap-card nothing-surface">
					<p class="row"><span class="mono-caps lab">Premium</span> {sw.premium}</p>
					<p class="row alt"><span class="mono-caps lab">Budget</span> {sw.budget}</p>
					{#if sw.note}
						<p class="note">{sw.note}</p>
					{/if}
				</div>
			{/each}
		{/if}

		{#each Object.entries(grouped) as [store, items] (store)}
			<SectionLabel text={`STORE: ${store}`} />
			{#each items as it (it.key)}
				<ChecklistRow
					checked={checked(it.key)}
					label={it.name}
					quantity={it.qty || '—'}
					onToggle={() => toggle(it.key)}
				/>
			{/each}
		{:else}
			<p class="empty">No grocery list in this plan.</p>
		{/each}

		<SecondaryButton label="+ Add Item" onclick={() => {}} />
	</main>
{/if}

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.budget-toggle {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-3);
		cursor: pointer;
	}

	.budget-toggle input {
		width: 20px;
		height: 20px;
		accent-color: var(--red);
	}

	.hint {
		width: 100%;
		margin: 0;
		font-size: 13px;
		color: var(--text-3);
		line-height: 1.4;
	}

	.swap-card {
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-2);
	}

	.row {
		margin: 0 0 6px;
		font-size: 14px;
		color: var(--text-2);
	}

	.row.alt {
		color: var(--text-1);
	}

	.lab {
		margin-right: 8px;
		font-size: 9px;
		color: var(--text-3);
	}

	.note {
		margin: 8px 0 0;
		font-size: 12px;
		color: var(--text-3);
		line-height: 1.4;
	}

	.empty {
		margin: 0 0 var(--space-3);
		font-size: 14px;
		color: var(--text-2);
	}
</style>
