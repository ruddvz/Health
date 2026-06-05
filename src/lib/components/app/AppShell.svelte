<script lang="ts">
	import BottomTabBar from './BottomTabBar.svelte';
	import TopStatusBar from './TopStatusBar.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showNav?: boolean;
		showStatus?: boolean;
	}
	let { children, showNav = true, showStatus = true }: Props = $props();
</script>

<div class="app-shell" class:app-shell--nav={showNav}>
	{#if showNav}
		<BottomTabBar />
	{/if}
	<div class="app-shell__content">
		{#if showStatus}
			<TopStatusBar />
		{/if}
		<main class="app-shell__main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.app-shell {
		position: relative;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.app-shell__content {
		flex: 1;
		min-width: 0;
		width: 100%;
	}

	.app-shell__main {
		width: 100%;
		max-width: var(--page-max);
		margin: 0 auto;
		padding-left: max(var(--page-x), env(safe-area-inset-left));
		padding-right: max(var(--page-x), env(safe-area-inset-right));
	}

	.app-shell--nav .app-shell__main {
		padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 28px);
	}

	.app-shell:not(.app-shell--nav) .app-shell__main {
		padding-bottom: calc(var(--safe-bottom) + 20px);
	}

	@media (min-width: 768px) {
		.app-shell--nav {
			display: grid;
			grid-template-columns: 88px minmax(0, 1fr);
			min-height: 100dvh;
		}

		.app-shell--nav .app-shell__main {
			padding: 0 var(--desktop-pad) 40px;
		}
	}

	@media (min-width: 1024px) {
		.app-shell--nav {
			grid-template-columns: 248px minmax(0, 1fr);
		}
	}
</style>
