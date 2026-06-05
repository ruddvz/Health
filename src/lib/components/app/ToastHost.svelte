<script lang="ts">
	import { toasts } from '$lib/stores/toast';

	function dismiss(id: string) {
		toasts.update((list) => list.filter((t) => t.id !== id));
	}
</script>

<div class="host" aria-live="polite" aria-relevant="additions">
	{#each $toasts as t (t.id)}
		<div class="toast" data-tone={t.tone} role="status">
			<p class="text">{t.text}</p>
			<button
				type="button"
				class="close pressable touch-target"
				aria-label="Dismiss"
				onclick={() => dismiss(t.id)}>×</button
			>
		</div>
	{/each}
</div>

<style>
	.host {
		position: fixed;
		bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px);
		left: 16px;
		right: 16px;
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		pointer-events: none;
		max-width: 400px;
		margin-inline: auto;
	}

	@media (min-width: 768px) {
		.host {
			left: auto;
			right: 24px;
			bottom: 24px;
			margin: 0;
		}
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--s-2);
		padding: 14px 16px;
		border-radius: 20px;
		pointer-events: auto;
		background: var(--h-glass-strong);
		border: 1px solid var(--h-line-strong);
		box-shadow: var(--shadow-card-soft);
		backdrop-filter: blur(var(--blur-nav));
		-webkit-backdrop-filter: blur(var(--blur-nav));
	}

	.toast[data-tone='success'] {
		border-color: var(--h-accent-line);
	}

	.toast[data-tone='error'] {
		border-color: var(--h-red-line);
	}

	.text {
		flex: 1;
		margin: 0;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text);
	}

	.close {
		flex-shrink: 0;
		border: none;
		border-radius: var(--r-xs);
		background: transparent;
		color: var(--h-text-muted);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
	}
</style>
