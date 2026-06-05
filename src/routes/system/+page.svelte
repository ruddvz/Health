<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/appRoutes';
	import AppHeader from '$lib/components/app/AppHeader.svelte';
	import HealthChip from '$lib/components/ui/HealthChip.svelte';
	import SettingsGroup from '$lib/components/ui/SettingsGroup.svelte';
	import SettingsRow from '$lib/components/ui/SettingsRow.svelte';
	import { plan } from '$lib/stores/healthApp';
	import { securityConfig } from '$lib/stores/healthLock';
	import {
		getPwaStatus,
		getStorageEstimate,
		type PwaStatus,
		type StorageEstimate
	} from '$lib/pwa/appStatus';

	let pwa = $state<PwaStatus | null>(null);
	let storage = $state<StorageEstimate | null>(null);

	onMount(() => {
		void getPwaStatus().then((s) => (pwa = s));
		void getStorageEstimate().then((s) => (storage = s));
	});

	const swLabel = $derived.by(() => {
		if (!pwa) return 'Checking…';
		switch (pwa.serviceWorker) {
			case 'active':
				return 'Offline ready';
			case 'pending':
				return 'Registering…';
			case 'unsupported':
				return 'Not supported';
			default:
				return 'Not registered';
		}
	});

	const installChip = $derived(
		pwa?.standalone
			? { label: 'Installed', tone: 'green' as const }
			: { label: 'Browser', tone: 'default' as const }
	);
</script>

<main class="screen page-stack">
	<AppHeader title="System" subtitle="Privacy, data, and tools" pageLabel="Settings" />

	<section class="status health-card" aria-live="polite">
		<h2 class="status__title">App status</h2>
		<div class="status__chips">
			<HealthChip tone={installChip.tone}>{installChip.label}</HealthChip>
			<HealthChip tone="blue">{swLabel}</HealthChip>
			<HealthChip tone="purple">Local storage</HealthChip>
		</div>
		<dl class="status__rows">
			<div>
				<dt>Version</dt>
				<dd>{pwa?.version ?? '—'}</dd>
			</div>
			<div>
				<dt>Service worker</dt>
				<dd>{swLabel}</dd>
			</div>
			{#if storage}
				<div>
					<dt>Storage used</dt>
					<dd>
						{storage.usageLabel} / {storage.quotaLabel}{storage.percent != null
							? ` (${storage.percent}%)`
							: ''}
					</dd>
				</div>
			{/if}
		</dl>
	</section>

	<SettingsGroup title="Health Lock">
		<SettingsRow
			icon="key"
			title="Health Lock"
			subtitle="PIN, Face ID, recovery codes"
			status={$securityConfig.enabled ? 'On' : 'Recommended'}
			statusTone={$securityConfig.enabled ? 'green' : 'amber'}
			href={ROUTES.systemSecurity}
		/>
	</SettingsGroup>

	<SettingsGroup title="Privacy & data">
		<SettingsRow
			icon="device"
			title="Local data"
			subtitle="Everything is stored on this device"
			status="Local"
			statusTone="purple"
			href={ROUTES.systemPrivacy}
		/>
		<SettingsRow
			icon="export"
			title="Export progress"
			subtitle="Weight, check-ins, workouts"
			href={ROUTES.systemSettingsProgressExport}
		/>
		<SettingsRow
			icon="export"
			title="Export plan"
			subtitle="Save a backup of your plan"
			href={ROUTES.systemSettingsExport}
		/>
	</SettingsGroup>

	<SettingsGroup title="App">
		<SettingsRow
			icon="shield"
			title="Offline & install"
			subtitle="PWA install and cache"
			href={ROUTES.systemAbout}
		/>
		<SettingsRow
			icon="chart"
			title="Plan diagnostics"
			subtitle="Check plan health and issues"
			href={ROUTES.systemDiagnostics}
		/>
		<SettingsRow
			icon="settings"
			title="Settings"
			subtitle="Theme, day type, exports"
			href={ROUTES.systemSettings}
		/>
	</SettingsGroup>

	<SettingsGroup title="Tools">
		<SettingsRow
			icon="chart"
			title="Phases"
			subtitle={$plan ? 'Targets by phase' : 'Import a plan first'}
			href={ROUTES.systemPhases}
		/>
		<SettingsRow
			icon="cart"
			title="Grocery"
			subtitle={$plan ? 'Store checklist' : 'Import a plan first'}
			href={ROUTES.systemGrocery}
		/>
		<SettingsRow
			icon="timer"
			title="Prep"
			subtitle={$plan ? 'Weekly prep steps' : 'Import a plan first'}
			href={ROUTES.systemPrep}
		/>
		<SettingsRow
			icon="pill"
			title="Supplements"
			subtitle={$plan ? 'Schedule and stack' : 'Import a plan first'}
			href={ROUTES.systemSupplements}
		/>
	</SettingsGroup>

	<section class="danger-zone health-card">
		<h2 class="danger-zone__title">Danger zone</h2>
		<p class="danger-zone__sub">Removing data cannot be undone. Export a backup first.</p>
		<a class="danger-link pressable" href={resolve(ROUTES.systemSettingsDanger)}>
			Delete local data
		</a>
	</section>
</main>

<style>
	.screen {
		flex: 1;
	}

	.status__title {
		margin: 0 0 var(--space-3);
		font-size: var(--text-md);
		font-weight: var(--weight-bold);
	}

	.status__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.status__rows {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.status__rows div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		font-size: var(--text-sm);
	}

	.status__rows dt {
		color: var(--health-muted);
		margin: 0;
	}

	.status__rows dd {
		margin: 0;
		color: var(--health-ink);
		font-weight: var(--weight-medium);
		text-align: right;
	}

	.danger-zone {
		padding: var(--space-4);
	}

	.danger-zone__title {
		margin: 0 0 var(--space-2);
		font-size: var(--text-md);
		color: var(--health-red);
	}

	.danger-zone__sub {
		margin: 0 0 var(--space-3);
		font-size: var(--text-sm);
		color: var(--health-muted);
	}

	.danger-link {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		margin-top: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--health-red-soft);
		color: var(--health-red);
		font-weight: var(--weight-semibold);
		text-decoration: none;
	}
</style>
