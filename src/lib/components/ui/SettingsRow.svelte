<script lang="ts">
	import { resolve } from '$app/paths';
	import type { AppRoute } from '$lib/appRoutes';
	import HealthChip from './HealthChip.svelte';
	import HealthIcon, { type IconName } from './HealthIcon.svelte';

	interface Props {
		icon?: IconName;
		title: string;
		subtitle?: string;
		status?: string;
		statusTone?: 'default' | 'green' | 'amber' | 'blue' | 'purple' | 'red';
		href?: AppRoute;
		tone?: 'default' | 'danger';
		onclick?: () => void;
	}

	let {
		icon = 'chevron',
		title,
		subtitle,
		status,
		statusTone = 'default',
		href,
		tone = 'default',
		onclick
	}: Props = $props();
</script>

{#if href}
	<a class="settings-row pressable" class:danger={tone === 'danger'} href={resolve(href)}>
		<span class="settings-row__icon" aria-hidden="true">
			<HealthIcon name={icon} size={20} />
		</span>
		<span class="settings-row__copy">
			<span class="settings-row__title">{title}</span>
			{#if subtitle}<span class="settings-row__sub">{subtitle}</span>{/if}
		</span>
		{#if status}
			<HealthChip tone={statusTone}>{status}</HealthChip>
		{/if}
		<span class="settings-row__chev" aria-hidden="true"
			><HealthIcon name="chevron" size={18} /></span
		>
	</a>
{:else}
	<button type="button" class="settings-row pressable" class:danger={tone === 'danger'} {onclick}>
		<span class="settings-row__icon" aria-hidden="true">
			<HealthIcon name={icon} size={20} />
		</span>
		<span class="settings-row__copy">
			<span class="settings-row__title">{title}</span>
			{#if subtitle}<span class="settings-row__sub">{subtitle}</span>{/if}
		</span>
		{#if status}
			<HealthChip tone={statusTone}>{status}</HealthChip>
		{/if}
		<span class="settings-row__chev" aria-hidden="true"
			><HealthIcon name="chevron" size={18} /></span
		>
	</button>
{/if}

<style>
	.settings-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: 56px;
		padding: var(--space-3) var(--space-4);
		text-align: left;
		text-decoration: none;
		color: inherit;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.settings-row.danger .settings-row__title {
		color: var(--health-red);
	}

	.settings-row__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		background: var(--health-surface-soft);
		color: var(--health-muted);
		flex-shrink: 0;
	}

	.settings-row__copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.settings-row__title {
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--health-ink);
	}

	.settings-row__sub {
		font-size: var(--text-sm);
		color: var(--health-muted);
		line-height: var(--leading-body);
	}

	.settings-row__chev {
		color: var(--health-faint);
		flex-shrink: 0;
	}
</style>
