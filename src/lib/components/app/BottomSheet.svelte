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
			class="sheet nothing-surface"
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
		z-index: 200;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: var(--modal-scrim, rgba(0, 0, 0, 0.55));
		cursor: pointer;
	}

	.sheet {
		position: relative;
		width: min(100vw, 430px);
		max-height: 86dvh;
		padding: var(--space-4);
		padding-bottom: calc(var(--space-4) + var(--safe-bottom));
		border-radius: var(--radius-sheet, 30px) var(--radius-sheet, 30px) 0 0;
		border: 1px solid var(--line-1);
		overflow: auto;
	}

	.handle {
		width: 36px;
		height: 4px;
		margin: 0 auto var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--line-2);
	}

	.h {
		margin: 0 0 var(--space-3);
		font-size: 11px;
		color: var(--text-2);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.body {
		margin-bottom: var(--space-2);
	}

	.footer {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}
</style>
