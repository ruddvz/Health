<script lang="ts">
	import { resolve } from '$app/paths';
	import { securityConfig } from '$lib/stores/healthLock';

	interface Props {
		pageContext?: string;
	}
	let { pageContext }: Props = $props();
</script>

<header class="top-status">
	<div class="top-status__left">
		<span class="brand">Health</span>
		{#if pageContext}
			<span class="context">{pageContext}</span>
		{/if}
	</div>
	<div class="top-status__right">
		<span class="pill">Local</span>
		<a
			class="pill pill--link pressable"
			href={resolve('/system/security')}
			aria-label="Health Lock status"
		>
			{#if $securityConfig.enabled}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<rect
						x="5"
						y="11"
						width="14"
						height="10"
						rx="2"
						stroke="currentColor"
						stroke-width="1.6"
					/>
					<path
						d="M8 11V8a4 4 0 0 1 8 0v3"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
					/>
				</svg>
				Locked
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<rect
						x="5"
						y="11"
						width="14"
						height="10"
						rx="2"
						stroke="currentColor"
						stroke-width="1.6"
					/>
					<path d="M8 11V8a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="1.6" />
				</svg>
				Open
			{/if}
		</a>
	</div>
</header>

<style>
	.top-status {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: calc(var(--safe-top) + 58px);
		padding: calc(var(--safe-top) + 10px) 0 8px;
		backdrop-filter: blur(var(--blur-nav));
		-webkit-backdrop-filter: blur(var(--blur-nav));
		background: linear-gradient(180deg, rgba(7, 10, 8, 0.82), rgba(7, 10, 8, 0.42), transparent);
	}

	:global(html[data-theme='light']) .top-status {
		background: linear-gradient(
			180deg,
			rgba(244, 247, 241, 0.9),
			rgba(244, 247, 241, 0.5),
			transparent
		);
	}

	.top-status__left,
	.top-status__right {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-width: 0;
	}

	.brand {
		font-size: var(--t-footnote);
		font-weight: var(--weight-bold);
		color: var(--h-text);
		letter-spacing: -0.02em;
	}

	.context {
		font-size: var(--t-caption);
		color: var(--h-text-muted);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 28px;
		padding: 0 10px;
		border-radius: var(--r-pill);
		border: 1px solid var(--h-line);
		background: var(--h-surface);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--h-text-muted);
		text-decoration: none;
	}

	.pill--link {
		color: var(--h-text-soft);
	}

	@media (min-width: 768px) {
		.top-status {
			min-height: calc(var(--safe-top) + 64px);
			padding-bottom: 12px;
		}
	}
</style>
