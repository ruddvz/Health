<script lang="ts">
	import { focusTrap } from '$lib/a11y/focusTrap';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		titleId?: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, title, titleId = 'sheet-title', onClose, children, footer }: Props = $props();
</script>

{#if open}
	<div class="modal" role="presentation">
		<button type="button" class="backdrop" aria-label="Close" onclick={onClose}></button>
		<div
			class="sheet health-glass"
			use:focusTrap={{ onEscape: onClose }}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
		>
			<div class="handle" aria-hidden="true"></div>
			<h2 id={titleId} class="h">{title}</h2>
			<div class="body">
				{@render children()}
			</div>
			{#if footer}
				<div class="footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: var(--modal-scrim);
		backdrop-filter: blur(var(--blur-sheet));
		-webkit-backdrop-filter: blur(var(--blur-sheet));
		cursor: pointer;
	}

	.sheet {
		position: relative;
		width: min(100vw, 430px);
		max-height: 86dvh;
		padding: var(--s-4);
		padding-bottom: calc(var(--s-4) + var(--safe-bottom));
		border-radius: var(--r-sheet) var(--r-sheet) 0 0;
		border: 1px solid var(--h-line-strong);
		overflow: auto;
	}

	.handle {
		width: 36px;
		height: 4px;
		margin: 0 auto var(--s-3);
		border-radius: var(--r-pill);
		background: var(--h-line-strong);
	}

	.h {
		margin: 0 0 var(--s-3);
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.body {
		margin-bottom: var(--s-2);
	}

	.footer {
		display: flex;
		gap: var(--s-2);
		margin-top: var(--s-3);
	}
</style>
