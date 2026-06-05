<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import HealthIcon, { type IconName } from '$lib/components/ui/HealthIcon.svelte';

	const tabs: { path: string; label: string; icon: IconName }[] = [
		{ path: '/today', label: 'Today', icon: 'sun' },
		{ path: '/meals', label: 'Meals', icon: 'fork' },
		{ path: '/train', label: 'Train', icon: 'bolt' },
		{ path: '/progress', label: 'Progress', icon: 'chart' },
		{ path: '/system', label: 'System', icon: 'shield' }
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

	function isActive(path: string) {
		if (path === '/system') return currentPath === '/system' || currentPath.startsWith('/system/');
		return currentPath === path;
	}
</script>

<nav class="bottom-tabs" aria-label="Primary">
	{#each tabs as tab (tab.path)}
		<a
			href={resolve(tab.path)}
			class="tab pressable"
			class:active={isActive(tab.path)}
			data-sveltekit-preload-data="tap"
			aria-current={isActive(tab.path) ? 'page' : undefined}
		>
			<HealthIcon name={tab.icon} size={20} />
			<span class="label">{tab.label}</span>
		</a>
	{/each}
</nav>

<style>
	.bottom-tabs {
		position: fixed;
		left: max(12px, env(safe-area-inset-left));
		right: max(12px, env(safe-area-inset-right));
		bottom: max(10px, env(safe-area-inset-bottom));
		z-index: 60;
		height: 64px;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 4px;
		padding: 6px;
		border-radius: 30px;
		background: var(--health-glass);
		border: 1px solid rgba(255, 255, 255, 0.62);
		box-shadow: var(--shadow-float);
		backdrop-filter: blur(24px) saturate(1.35);
		-webkit-backdrop-filter: blur(24px) saturate(1.35);
		max-width: 430px;
		margin-inline: auto;
	}

	@media (min-width: 900px) {
		.bottom-tabs {
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
			border-right: 1px solid var(--health-line);
			border-top: none;
			border-bottom: none;
			padding: calc(env(safe-area-inset-top) + 16px) 8px 16px;
			grid-template-columns: 1fr;
			grid-template-rows: repeat(5, 1fr);
			gap: 8px;
			background: var(--health-surface);
			backdrop-filter: none;
		}
	}

	.tab {
		min-width: 0;
		border-radius: 24px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 3px;
		color: var(--health-muted);
		text-decoration: none;
		font-size: 10px;
		font-weight: var(--weight-semibold);
		letter-spacing: -0.01em;
	}

	.tab.active {
		background: var(--health-primary);
		color: var(--health-primary-text);
		box-shadow: 0 8px 18px rgba(20, 17, 15, 0.16);
	}

	.label {
		line-height: 1.1;
	}

	@media (min-width: 900px) {
		.tab {
			padding: 10px 4px;
		}
	}
</style>
