<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import RequiresPlan from '$lib/components/app/RequiresPlan.svelte';
	import ChecklistRow from '$lib/components/spec/ChecklistRow.svelte';
	import ChipRow from '$lib/components/spec/ChipRow.svelte';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SecondaryButton from '$lib/components/spec/SecondaryButton.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import { newId } from '$lib/logic/id';
	import { flattenGrocery, getBudgetSwaps } from '$lib/logic/planDerive';
	import { persistProgress, plan, progress } from '$lib/stores/healthApp';
	import { showToast } from '$lib/stores/toast';
	import { get } from 'svelte/store';

	let chip = $state('All');
	let showBudgetSwaps = $state(false);
	let addOpen = $state(false);
	let itemName = $state('');
	let itemQty = $state('');
	let itemStore = $state('SUPERMARKET');

	const budgetSwaps = $derived(getBudgetSwaps($plan));

	const allRows = $derived.by(() => {
		const fromPlan = flattenGrocery($plan);
		const extras = ($progress.groceryExtras ?? []).map((e) => ({
			store: e.store,
			name: e.name,
			qty: e.qty,
			key: e.key
		}));
		return [...fromPlan, ...extras];
	});

	const grouped = $derived.by(() => {
		const byStore: Record<string, typeof allRows> = {};
		for (const r of allRows) {
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

	function saveExtraItem() {
		const name = itemName.trim();
		if (!name) return;
		const cur = get(progress);
		const key = `extra:${newId()}`;
		const row = {
			key,
			name,
			qty: itemQty.trim() || '—',
			store: itemStore.trim() || 'SUPERMARKET'
		};
		persistProgress({ ...cur, groceryExtras: [...(cur.groceryExtras ?? []), row] });
		showToast('Added to your grocery list', 'success');
		addOpen = false;
		itemName = '';
		itemQty = '';
		itemStore = 'SUPERMARKET';
	}
</script>

<RequiresPlan
	title="GROCERY"
	emptyTitle="Grocery list needs a plan"
	emptyBody="Your shopping list is built from the grocery section in your Health JSON. Import a plan or use the demo sample to check off items by store."
>
	<main class="screen px-screen pt-safe stack">
		<ScreenHeaderBlock title="GROCERY" />
		<p class="disclaimer">
			List prices and store totals in your plan are estimates — confirm at checkout. Promos vary by
			region.
		</p>
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

		<SecondaryButton label="+ Add Item" onclick={() => (addOpen = true)} />
	</main>
</RequiresPlan>

<BottomSheet open={addOpen} title="Add grocery item" onClose={() => (addOpen = false)}>
	<p class="sub">Saved locally for this device. Does not change your imported plan JSON.</p>
	<label class="field-stack">
		<span class="mono-caps">Item name</span>
		<input class="inp-shell" type="text" bind:value={itemName} placeholder="e.g. Greek yogurt" />
	</label>
	<label class="field-stack">
		<span class="mono-caps">Quantity</span>
		<input class="inp-shell" type="text" bind:value={itemQty} placeholder="2 tubs" />
	</label>
	<label class="field-stack">
		<span class="mono-caps">Store</span>
		<input class="inp-shell" type="text" bind:value={itemStore} placeholder="SUPERMARKET" />
	</label>
	{#snippet footer()}
		<div class="sheet-actions">
			<button type="button" class="sheet-btn pressable" onclick={() => (addOpen = false)}
				>Cancel</button
			>
			<button type="button" class="sheet-btn primary pressable" onclick={saveExtraItem}>Add</button>
		</div>
	{/snippet}
</BottomSheet>

<style>
	.disclaimer {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-3);
	}

	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.sub {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		color: var(--text-3);
		line-height: 1.45;
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
		accent-color: var(--h-accent);
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
