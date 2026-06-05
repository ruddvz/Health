<script lang="ts">
	import { toasts } from '$lib/stores/toast';

	function dismiss(id: string) {
		toasts.update((list) => list.filter((t) => t.id !== id));
	}
</script>

<div class="host" aria-live="polite" aria-relevant="additions">
	{#each $toasts as t (t.id)}
		<div class="toast nothing-surface" data-tone={t.tone} role="status">
			<p class="text">{t.text}</p>
			<button
				type="button"
				class="close pressable"
				aria-label="Dismiss"
				onclick={() => dismiss(t.id)}>×</button
			>
		</div>
	{/each}
</div>

<style>
	.host {
		position: fixed;
		top: calc(var(--safe-top) + var(--space-3));
		left: 50%;
		transform: translateX(-50%);
		z-index: 300;
		width: min(100vw - var(--space-4) * 2, 400px);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		pointer-events: auto;
		box-shadow: var(--shadow-card);
	}

	.toast[data-tone='success'] {
		border-color: rgba(52, 199, 89, 0.45);
	}

	.toast[data-tone='error'] {
		border-color: var(--red-line);
	}

	.text {
		flex: 1;
		margin: 0;
		font-size: 14px;
		line-height: 1.45;
		color: var(--text-1);
	}

	.close {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-xs);
		background: transparent;
		color: var(--text-3);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
	}
</style>
