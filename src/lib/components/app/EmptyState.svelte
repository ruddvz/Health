<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		body: string;
		eyebrow?: string;
		children?: Snippet;
		preview?: Snippet;
	}

	let { title, body, eyebrow, children, preview }: Props = $props();
</script>

<section class="empty nothing-surface" aria-labelledby="empty-title">
	{#if eyebrow}
		<p class="eyebrow mono-caps">{eyebrow}</p>
	{/if}
	<h2 id="empty-title" class="title">{title}</h2>
	<p class="body">{body}</p>
	{#if preview}
		<div class="preview" aria-hidden="true">
			{@render preview()}
		</div>
	{/if}
	{#if children}
		<div class="actions">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.empty {
		padding: var(--space-5) var(--space-4);
		margin-bottom: var(--space-4);
		border-radius: var(--radius-card, var(--radius-lg));
	}

	.eyebrow {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
		letter-spacing: 0.08em;
	}

	.title {
		margin: 0 0 var(--space-2);
		font-size: 22px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--text-1);
		letter-spacing: -0.02em;
	}

	.body {
		margin: 0;
		font-size: 15px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.preview {
		display: grid;
		gap: 10px;
		margin-top: var(--space-4);
		opacity: 0.45;
		pointer-events: none;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: var(--space-5);
	}

	:global(.empty .btn-primary) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 12px 18px;
		border-radius: var(--radius-control, var(--radius-sm));
		border: none;
		background: var(--accent, var(--ios-blue, var(--red)));
		color: #fff;
		font-size: 16px;
		font-weight: 650;
		text-decoration: none;
		cursor: pointer;
	}

	:global(.empty .btn-secondary) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 12px 18px;
		border-radius: var(--radius-control, var(--radius-sm));
		border: 1px solid var(--line-2);
		background: transparent;
		color: var(--text-1);
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	:global(.empty .btn-ghost) {
		min-height: 44px;
		padding: 10px 14px;
		border: none;
		background: transparent;
		color: var(--text-2);
		font-size: 14px;
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	:global(.empty .preview-card) {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px dashed var(--line-2);
		background: rgba(0, 0, 0, 0.2);
	}

	:global(.empty .preview-card .pc-label) {
		margin: 0;
		font-size: 10px;
		color: var(--text-3);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	:global(.empty .preview-card .pc-val) {
		margin: 6px 0 0;
		font-size: 14px;
		color: var(--text-2);
	}
</style>
