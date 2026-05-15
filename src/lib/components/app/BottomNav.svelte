<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';

	const tabs = [
		{
			path: '/today',
			href: resolve('/today'),
			label: 'Today',
			icon: 'home'
		},
		{
			path: '/meals',
			href: resolve('/meals'),
			label: 'Meals',
			icon: 'meals'
		},
		{
			path: '/train',
			href: resolve('/train'),
			label: 'Train',
			icon: 'train'
		},
		{
			path: '/progress',
			href: resolve('/progress'),
			label: 'Progress',
			icon: 'trend'
		},
		{
			path: '/system',
			href: resolve('/system'),
			label: 'System',
			icon: 'system'
		}
	] as const;

	function normalizePathname(pathname: string): string {
		let p = pathname;
		if (base && p.startsWith(base)) {
			p = p.slice(base.length) || '/';
		}
		if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
		return p || '/';
	}

	const currentPath = $derived(normalizePathname(page.url.pathname));

	function active(path: string) {
		if (path === '/system') return currentPath === '/system' || currentPath.startsWith('/system/');
		return currentPath === path;
	}
</script>

<nav class="nav" aria-label="Primary">
	<ul class="list">
		{#each tabs as tab (tab.path)}
			<li>
				<a
					href={tab.href}
					class="tab pressable"
					class:active={active(tab.path)}
					data-sveltekit-preload-data="tap"
					aria-current={active(tab.path) ? 'page' : undefined}
				>
					<span class="ico" aria-hidden="true">
						{#if tab.icon === 'home'}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<path
									d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linejoin="round"
								/>
							</svg>
						{:else if tab.icon === 'meals'}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<rect
									x="4"
									y="5"
									width="16"
									height="15"
									rx="2"
									stroke="currentColor"
									stroke-width="1.6"
								/>
								<path
									d="M8 3v4M16 3v4"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
								<path
									d="M8 11h8M8 15h5"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
							</svg>
						{:else if tab.icon === 'train'}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<path
									d="M6 10h12v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8Z"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linejoin="round"
								/>
								<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.6" />
								<path d="M9 18h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							</svg>
						{:else if tab.icon === 'trend'}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<path
									d="M4 18V6M10 18v-5M16 18V9M22 18V4"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
							</svg>
						{:else}
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<path
									d="M6 8h12M6 12h12M6 16h8"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
								<circle cx="18" cy="16" r="1.6" fill="currentColor" />
							</svg>
						{/if}
					</span>
					<span class="label">{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nav {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		width: min(100vw, 430px);
		bottom: 0;
		z-index: 30;
		padding: 8px 12px calc(8px + var(--safe-bottom));
		box-sizing: border-box;
		background: rgba(11, 11, 11, 0.92);
		backdrop-filter: blur(18px) saturate(160%);
		-webkit-backdrop-filter: blur(18px) saturate(160%);
		border-top: 1px solid var(--line-1);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		min-height: var(--nav-h);
	}

	li {
		margin: 0;
	}

	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		height: 100%;
		min-height: var(--nav-h);
		padding: 6px 2px;
		border-radius: var(--radius-sm);
		color: var(--text-3);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	@supports (corner-shape: squircle) {
		.tab {
			corner-shape: squircle;
		}
	}

	.tab.active {
		color: var(--red);
		background: rgba(255, 42, 42, 0.12);
		box-shadow: none;
	}

	.ico {
		display: flex;
		align-items: center;
		justify-content: center;
		color: currentColor;
	}

	.label {
		font-family: var(--font-ui);
		font-size: 9px;
		font-weight: 500;
		letter-spacing: -0.01em;
		line-height: 1.1;
		text-align: center;
		max-width: 100%;
		padding: 0 1px;
	}

	@media (prefers-reduced-motion: reduce) {
		.tab.pressable:active {
			transform: none;
		}
	}

	.tab.pressable:active {
		transform: scale(0.96);
	}
</style>
