<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<section class="settings-group">
	{#if title}
		<h2 class="settings-group__title">{title}</h2>
	{/if}
	<div class="settings-group__rows">
		{@render children()}
	</div>
</section>

<style>
	.settings-group {
		margin-bottom: var(--space-5);
	}

	.settings-group__title {
		margin: 0 0 var(--space-2);
		padding: 0 var(--space-1);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--health-muted);
	}

	.settings-group__rows {
		background: var(--health-surface);
		border: 1px solid var(--health-line);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card-soft);
		overflow: hidden;
	}

	.settings-group__rows :global(.settings-row:not(:last-child)) {
		border-bottom: 1px solid var(--health-line);
	}
</style>
