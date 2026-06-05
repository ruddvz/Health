<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		body: string;
		eyebrow?: string;
		icon?: string;
		children?: Snippet;
		preview?: Snippet;
	}

	let { title, body, eyebrow, icon = '✦', children, preview }: Props = $props();
</script>

<section class="empty health-card" aria-labelledby="empty-title">
	<div class="empty__orb" aria-hidden="true">{icon}</div>
	{#if eyebrow}
		<p class="empty__eyebrow">{eyebrow}</p>
	{/if}
	<h2 id="empty-title" class="empty__title">{title}</h2>
	<p class="empty__body">{body}</p>
	{#if preview}
		<div class="empty__preview" aria-hidden="true">
			{@render preview()}
		</div>
	{/if}
	{#if children}
		<div class="empty__actions">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.empty {
		padding: var(--s-6) var(--s-5);
		text-align: left;
	}

	.empty__orb {
		width: 52px;
		height: 52px;
		margin: 0 0 var(--s-4);
		display: grid;
		place-items: center;
		border-radius: var(--r-control);
		background: var(--h-accent-soft);
		color: var(--h-accent);
		font-size: 22px;
		font-weight: var(--weight-bold);
	}

	.empty__eyebrow {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.empty__title {
		margin: 0 0 var(--s-2);
		font-size: var(--t-title-2);
		font-weight: var(--weight-bold);
		line-height: var(--lh-title);
		color: var(--h-text);
		letter-spacing: -0.02em;
	}

	.empty__body {
		margin: 0;
		font-size: var(--t-body);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}

	.empty__preview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-2);
		margin-top: var(--s-5);
		opacity: 0.55;
		pointer-events: none;
	}

	.empty__actions {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		margin-top: var(--s-5);
	}

	:global(.empty .preview-card) {
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		border: 1px dashed var(--h-line);
		background: var(--h-surface-2);
		text-align: left;
	}

	:global(.empty .preview-card .pc-label) {
		margin: 0;
		font-size: var(--t-caption-2);
		color: var(--h-text-faint);
	}

	:global(.empty .preview-card .pc-val) {
		margin: var(--s-2) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}
</style>
