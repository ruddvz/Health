<script lang="ts">
	import BottomTabBar from './BottomTabBar.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showNav?: boolean;
	}
	let { children, showNav = true }: Props = $props();
</script>

<div class="shell" class:shell--nav={showNav}>
	<div class="shell__main">
		{@render children()}
	</div>
	{#if showNav}
		<BottomTabBar />
	{/if}
</div>

<style>
	.shell {
		position: relative;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.shell__main {
		flex: 1;
		width: 100%;
		max-width: var(--page-max);
		margin: 0 auto;
		padding-left: max(var(--mobile-pad), env(safe-area-inset-left));
		padding-right: max(var(--mobile-pad), env(safe-area-inset-right));
		padding-top: max(12px, env(safe-area-inset-top));
	}

	.shell--nav .shell__main {
		padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 16px);
	}

	.shell:not(.shell--nav) .shell__main {
		padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
	}

	@media (min-width: 900px) {
		.shell--nav {
			padding-left: 88px;
		}

		.shell--nav .shell__main {
			padding-bottom: var(--space-8);
			padding-left: var(--desktop-pad);
			padding-right: var(--desktop-pad);
		}
	}

	@media (min-width: 1024px) {
		.shell__main {
			padding-left: var(--desktop-pad);
			padding-right: var(--desktop-pad);
		}
	}
</style>
