<script lang="ts">
	import { resolve } from '$app/paths';
	import { ROUTES, type AppRoute } from '$lib/appRoutes';

	const links: { label: string; href: AppRoute; full?: boolean }[] = [
		{ label: 'Phases', href: ROUTES.systemPhases },
		{ label: 'Meals', href: ROUTES.meals },
		{ label: 'Prep', href: ROUTES.systemPrep },
		{ label: 'Grocery', href: ROUTES.systemGrocery },
		{ label: 'Supplements', href: ROUTES.systemSupplements, full: true }
	];
</script>

<section class="quick" aria-labelledby="quick-nav-title">
	<h2 id="quick-nav-title" class="mono-caps lab">Quick navigation</h2>
	<div class="grid">
		{#each links as item (item.label)}
			<a class="card pressable" class:full={item.full} href={resolve(item.href)}>
				<span>{item.label}</span>
				<span class="chev" aria-hidden="true">›</span>
			</a>
		{/each}
	</div>
</section>

<style>
	.lab {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: var(--space-4);
	}

	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 52px;
		padding: 0 var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-1);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: 14px;
		font-weight: 650;
		text-decoration: none;
	}

	.card.full {
		grid-column: 1 / -1;
	}

	.chev {
		color: var(--text-3);
		font-size: 18px;
	}
</style>
