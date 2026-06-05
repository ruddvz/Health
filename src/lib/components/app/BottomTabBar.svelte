<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import HealthIcon from '$lib/components/ui/HealthIcon.svelte';

	const tabHrefs = {
		'/today': resolve('/today'),
		'/meals': resolve('/meals'),
		'/train': resolve('/train'),
		'/progress': resolve('/progress'),
		'/system': resolve('/system')
	} as const;

	const tabs = [
		{ path: '/today' as const, label: 'Today', icon: 'sun' as const },
		{ path: '/meals' as const, label: 'Meals', icon: 'fork' as const },
		{ path: '/train' as const, label: 'Train', icon: 'bolt' as const },
		{ path: '/progress' as const, label: 'Progress', icon: 'chart' as const },
		{ path: '/system' as const, label: 'System', icon: 'shield' as const }
	];

	function normalizePathname(pathname: string): string {
		let p = pathname;
		if (base && p.startsWith(base)) {
			p = p.slice(base.length) || '/';
		}
		if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
		return p || '/';
	}

	const currentPath = $derived(normalizePathname(page.url.pathname));

	function isActive(path: (typeof tabs)[number]['path']) {
		if (path === '/system') return currentPath === '/system' || currentPath.startsWith('/system/');
		return currentPath === path;
	}
</script>

<nav class="bottom-nav" aria-label="Primary">
	<ul class="bottom-nav__list">
		{#each tabs as tab (tab.path)}
			<li>
				<a
					href={tabHrefs[tab.path]}
					class="tab pressable"
					class:active={isActive(tab.path)}
					data-sveltekit-preload-data="tap"
					aria-current={isActive(tab.path) ? 'page' : undefined}
				>
					<span class="tab__icon" aria-hidden="true">
						<HealthIcon name={tab.icon} size={20} />
					</span>
					<span class="tab__label">{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.bottom-nav {
		position: fixed;
		left: 14px;
		right: 14px;
		bottom: calc(10px + var(--safe-bottom));
		z-index: var(--z-nav);
		height: 68px;
		padding: 6px;
		border-radius: 30px;
		background: var(--h-glass-strong);
		border: 1px solid var(--h-line-strong);
		box-shadow: var(--shadow-nav);
		backdrop-filter: blur(var(--blur-nav)) saturate(1.2);
		-webkit-backdrop-filter: blur(var(--blur-nav)) saturate(1.2);
		max-width: 430px;
		margin-inline: auto;
	}

	@media (min-width: 430px) {
		.bottom-nav {
			left: 18px;
			right: 18px;
		}
	}

	.bottom-nav__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		height: 100%;
		gap: 4px;
	}

	li {
		margin: 0;
		min-width: 0;
	}

	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		min-height: 56px;
		height: 100%;
		border-radius: 24px;
		color: var(--h-text-muted);
		text-decoration: none;
	}

	.tab.active {
		background: var(--h-accent-soft);
		border: 1px solid var(--h-accent-line);
		color: var(--h-text);
	}

	.tab__icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tab__label {
		font-size: 11px;
		font-weight: 650;
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	@media (min-width: 768px) {
		.bottom-nav {
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			right: auto;
			width: 88px;
			height: auto;
			max-width: none;
			margin: 0;
			border-radius: 0;
			border: none;
			border-right: 1px solid var(--h-line);
			padding: calc(var(--safe-top) + 16px) 8px calc(var(--safe-bottom) + 16px);
			box-shadow: none;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
			background: var(--h-surface-solid);
		}

		.bottom-nav__list {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(5, minmax(56px, auto));
			gap: 6px;
		}

		.tab {
			padding: 8px 4px;
		}
	}

	@media (min-width: 1024px) {
		.bottom-nav {
			width: 248px;
			padding-inline: 12px;
		}

		.tab {
			flex-direction: row;
			justify-content: flex-start;
			gap: 12px;
			padding: 12px 14px;
		}

		.tab__label {
			font-size: var(--t-footnote);
		}
	}
</style>
