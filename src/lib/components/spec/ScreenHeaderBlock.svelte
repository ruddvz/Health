<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow?: string;
		title: string;
		subtitle?: string;
		right?: Snippet;
	}
	let { eyebrow, title, subtitle, right }: Props = $props();
</script>

<header class="head">
	<div class="left">
		{#if eyebrow}
			<p class="eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="title">{title}</h1>
		{#if subtitle}
			<p class="sub">{subtitle}</p>
		{/if}
	</div>
	{#if right}
		<div class="right">{@render right()}</div>
	{/if}
</header>

<style>
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
		margin: 8px 0 18px;
	}

	.left {
		min-width: 0;
		flex: 1;
	}

	.eyebrow {
		margin: 0 0 6px;
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--h-text-faint);
	}

	.title {
		margin: 0;
		font-size: clamp(28px, 7vw, var(--t-title-1));
		font-weight: 760;
		letter-spacing: -0.03em;
		line-height: var(--lh-title);
		color: var(--h-text);
	}

	.sub {
		margin: 6px 0 0;
		font-size: var(--t-callout);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}

	.right {
		flex-shrink: 0;
		padding-top: 4px;
	}

	@media (min-width: 768px) {
		.head {
			margin-bottom: 24px;
		}
	}
</style>
