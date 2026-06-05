<script lang="ts">
	interface Props {
		lines?: number;
		tall?: boolean;
	}

	let { lines = 3, tall = false }: Props = $props();
</script>

<div class="skeleton health-card" class:skeleton--tall={tall} aria-hidden="true">
	<div class="skeleton__bar skeleton__bar--title"></div>
	{#each Array.from({ length: lines }, (_, i) => i) as i (i)}
		<div class="skeleton__bar" style:width="{70 + (i % 3) * 8}%"></div>
	{/each}
</div>

<style>
	.skeleton--tall {
		min-height: 120px;
	}

	.skeleton__bar {
		height: 12px;
		margin-bottom: 10px;
		border-radius: var(--radius-xs);
		background: linear-gradient(
			90deg,
			var(--health-surface-soft) 0%,
			var(--health-faint) 50%,
			var(--health-surface-soft) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.2s ease-in-out infinite;
	}

	.skeleton__bar--title {
		height: 18px;
		width: 55%;
		margin-bottom: 14px;
	}

	@keyframes shimmer {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton__bar {
			animation: none;
		}
	}
</style>
