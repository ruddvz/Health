<script lang="ts">
	import BottomNav from './BottomNav.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showNav?: boolean;
	}
	let { children, showNav = true }: Props = $props();
</script>

<div class="shell">
	<div class="dot-layer" aria-hidden="true"></div>
	<div class="content" class:pb-nav={showNav} class:pb-min={!showNav}>
		{@render children()}
	</div>
	{#if showNav}
		<BottomNav />
	{/if}
</div>

<style>
	.shell {
		position: relative;
		isolation: isolate;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		overflow-x: hidden;
	}

	/* AppShell: dot grid at 15% opacity (component_specs.AppShell) */
	.dot-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.15;
		pointer-events: none;
		background-image: radial-gradient(circle at 1px 1px, var(--dot-grid-dot) 1px, transparent 0);
		background-size: 18px 18px;
	}

	.content {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.pb-nav {
		padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + var(--space-6));
	}

	.pb-min {
		padding-bottom: calc(var(--space-6) + var(--safe-bottom));
	}
</style>
