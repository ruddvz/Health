<script lang="ts">
	import { resolve } from '$app/paths';
	import HealthChip from '$lib/components/ui/HealthChip.svelte';
	import { securityConfig } from '$lib/stores/healthLock';
	import { plan } from '$lib/stores/healthApp';

	interface Props {
		title: string;
		subtitle?: string;
		pageLabel?: string;
		planState?: 'none' | 'demo' | 'loaded' | 'locked' | 'error';
		rightAction?: 'lock' | 'settings' | 'none';
	}

	let { title, subtitle, pageLabel, planState, rightAction = 'lock' }: Props = $props();

	const effectivePlanState = $derived(planState ?? ($plan ? 'loaded' : 'none'));

	const chipLabel = $derived.by(() => {
		if (effectivePlanState === 'none') return 'No plan yet';
		if (effectivePlanState === 'demo') return 'Demo plan';
		if (effectivePlanState === 'error') return 'Plan issue';
		return null;
	});
</script>

<header class="app-header">
	<div class="app-header__copy">
		{#if pageLabel}
			<p class="app-header__eyebrow">{pageLabel}</p>
		{/if}
		<h1>{title}</h1>
		{#if subtitle}
			<p class="app-header__sub">{subtitle}</p>
		{/if}
		{#if chipLabel}
			<div class="app-header__chip">
				<HealthChip tone="amber">{chipLabel}</HealthChip>
			</div>
		{/if}
	</div>
	{#if rightAction === 'lock'}
		<a
			class="app-header__action pressable"
			href={resolve('/system/security')}
			aria-label="Health Lock status"
		>
			{$securityConfig.enabled ? 'Locked' : 'Local'}
		</a>
	{:else if rightAction === 'settings'}
		<a
			class="app-header__action pressable"
			href={resolve('/system/settings')}
			aria-label="Settings"
		>
			Settings
		</a>
	{/if}
</header>

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
		padding: calc(var(--safe-top) + var(--s-2)) 0 var(--s-3);
		margin: var(--s-2) 0 var(--s-4);
		background: linear-gradient(to bottom, var(--h-bg) 76%, transparent);
		backdrop-filter: blur(var(--blur-nav));
		-webkit-backdrop-filter: blur(var(--blur-nav));
	}

	.app-header__copy {
		min-width: 0;
		flex: 1;
	}

	.app-header__copy h1 {
		margin: 0;
		font-size: clamp(28px, 7vw, var(--t-title-1));
		line-height: var(--lh-title);
		letter-spacing: -0.03em;
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.app-header__eyebrow {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.app-header__sub {
		margin: var(--s-2) 0 0;
		color: var(--h-text-muted);
		font-size: var(--t-callout);
		line-height: var(--lh-body);
	}

	.app-header__chip {
		margin-top: var(--s-2);
	}

	.app-header__action {
		flex-shrink: 0;
		min-height: 44px;
		border: 1px solid var(--h-line);
		border-radius: var(--r-pill);
		padding: 0 var(--s-3);
		display: inline-flex;
		align-items: center;
		background: var(--h-surface);
		color: var(--h-text);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		text-decoration: none;
		box-shadow: var(--shadow-card-soft);
	}
</style>
