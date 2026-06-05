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
	<div class="app-header__mark" aria-hidden="true">H</div>
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
			class="app-header__lock pressable"
			href={resolve('/system/security')}
			aria-label="Health Lock status"
		>
			{$securityConfig.enabled ? 'Locked' : 'Local'}
		</a>
	{:else if rightAction === 'settings'}
		<a class="app-header__lock pressable" href={resolve('/system/settings')} aria-label="Settings">
			Settings
		</a>
	{/if}
</header>

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) auto;
		gap: 12px;
		align-items: center;
		padding: calc(env(safe-area-inset-top) + 10px) 0 10px;
		margin-bottom: var(--space-3);
		background: linear-gradient(to bottom, var(--health-bg) 76%, transparent);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
	}

	.app-header__mark {
		width: 44px;
		height: 44px;
		border-radius: 16px;
		display: grid;
		place-items: center;
		background: var(--health-primary);
		color: var(--health-primary-text);
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		box-shadow: var(--shadow-card-soft);
	}

	.app-header__copy {
		min-width: 0;
	}

	.app-header__copy h1 {
		margin: 0;
		font-size: 22px;
		line-height: 1.1;
		letter-spacing: -0.03em;
		font-weight: var(--weight-bold);
		color: var(--health-ink);
	}

	.app-header__eyebrow {
		margin: 0 0 3px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: var(--text-2xs);
		font-weight: var(--weight-bold);
		color: var(--health-muted-2);
	}

	.app-header__sub {
		margin: 2px 0 0;
		color: var(--health-muted);
		font-size: var(--text-sm);
		line-height: 1.25;
	}

	.app-header__chip {
		margin-top: 6px;
	}

	.app-header__lock {
		min-height: 38px;
		border: 1px solid var(--health-line);
		border-radius: var(--radius-pill);
		padding: 0 12px;
		display: inline-flex;
		align-items: center;
		background: var(--health-surface-raised);
		color: var(--health-ink);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-decoration: none;
		box-shadow: var(--shadow-card-soft);
	}
</style>
