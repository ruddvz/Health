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
		padding: var(--space-6) var(--space-5);
		text-align: center;
	}

	.empty__orb {
		width: 52px;
		height: 52px;
		margin: 0 auto var(--space-4);
		display: grid;
		place-items: center;
		border-radius: 18px;
		background: var(--health-green-soft);
		color: var(--health-green);
		font-size: 22px;
		font-weight: var(--weight-bold);
	}

	.empty__eyebrow {
		margin: 0 0 var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--weight-bold);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--health-muted-2);
	}

	.empty__title {
		margin: 0 0 var(--space-2);
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		line-height: var(--leading-title);
		color: var(--health-ink);
		letter-spacing: -0.02em;
	}

	.empty__body {
		margin: 0;
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--health-muted);
	}

	.empty__preview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
		margin-top: var(--space-5);
		opacity: 0.55;
		pointer-events: none;
	}

	.empty__actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-5);
	}

	:global(.empty .preview-card) {
		padding: var(--space-3);
		border-radius: var(--radius-md);
		border: 1px dashed var(--health-line);
		background: var(--health-surface-soft);
		text-align: left;
	}

	:global(.empty .preview-card .pc-label) {
		margin: 0;
		font-size: var(--text-2xs);
		color: var(--health-muted-2);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	:global(.empty .preview-card .pc-val) {
		margin: 6px 0 0;
		font-size: var(--text-sm);
		color: var(--health-muted);
	}
</style>
