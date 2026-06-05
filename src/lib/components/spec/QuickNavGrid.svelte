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
	<h2 id="quick-nav-title" class="lab">Quick navigation</h2>
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
		margin: 0 0 var(--s-2);
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--phone-card-gap);
		margin-bottom: var(--s-4);
	}

	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 56px;
		padding: 0 var(--s-4);
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
		color: var(--h-text);
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		text-decoration: none;
	}

	.card.full {
		grid-column: 1 / -1;
	}

	.chev {
		color: var(--h-text-faint);
		font-size: 18px;
	}
</style>
