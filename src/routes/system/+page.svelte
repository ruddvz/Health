<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/appRoutes';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
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

	function clearCache() {
		if ('serviceWorker' in navigator) {
			void navigator.serviceWorker.getRegistrations().then((regs) => {
				for (const r of regs) void r.unregister();
			});
		}
		window.location.reload();
	}
</script>

<main class="screen page-stack">
	<ScreenHeaderBlock title="System" subtitle="Privacy, data, and tools" />

	<section class="status card" aria-live="polite">
		<h2 class="status__title">Local-first status</h2>
		<div class="status__chips">
			<HealthChip tone={installChip.tone}>{installChip.label}</HealthChip>
			<HealthChip tone="blue">{swLabel}</HealthChip>
			<HealthChip tone="green">Local only</HealthChip>
		</div>
		<dl class="status__rows">
			<div>
				<dt>Version</dt>
				<dd>{pwa?.version ?? '—'}</dd>
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

	<SettingsGroup title="Plan management">
		<SettingsRow
			icon="import"
			title="Import or replace plan"
			subtitle="Paste or upload JSON"
			href={ROUTES.import}
		/>
		<SettingsRow
			icon="export"
			title="Export plan JSON"
			subtitle="Backup your plan"
			href={ROUTES.systemSettingsExport}
		/>
		<SettingsRow
			icon="export"
			title="Export progress JSON"
			subtitle="Weight, check-ins, workouts"
			href={ROUTES.systemSettingsProgressExport}
		/>
		<SettingsRow
			icon="shield"
			title="Clear cache and reload"
			subtitle="Refresh offline assets"
			onclick={clearCache}
		/>
	</SettingsGroup>

	<SettingsGroup title="Health modules">
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

	<SettingsGroup title="Security">
		<SettingsRow
			icon="key"
			title="Health Lock"
			subtitle="PIN, Face ID, recovery codes"
			status={$securityConfig.enabled ? 'On' : 'Recommended'}
			statusTone={$securityConfig.enabled ? 'green' : 'amber'}
			href={ROUTES.systemSecurity}
		/>
		<SettingsRow
			icon="key"
			title="Passkey & recovery"
			subtitle="Manage unlock methods"
			href={ROUTES.systemSecurity}
		/>
	</SettingsGroup>

	<SettingsGroup title="Diagnostics">
		<SettingsRow
			icon="chart"
			title="Plan checks"
			subtitle="Validation and warnings"
			href={ROUTES.systemDiagnostics}
		/>
		<SettingsRow
			icon="device"
			title="Privacy"
			subtitle="How your data stays local"
			href={ROUTES.systemPrivacy}
		/>
		<SettingsRow
			icon="shield"
			title="About & offline"
			subtitle="PWA install and version"
			href={ROUTES.systemAbout}
		/>
		<SettingsRow
			icon="settings"
			title="Settings"
			subtitle="Theme, day type, appearance"
			href={ROUTES.systemSettings}
		/>
	</SettingsGroup>

	<section class="danger-zone card">
		<h2 class="danger-zone__title">Danger zone</h2>
		<p class="danger-zone__sub">Removing data cannot be undone. Export a backup first.</p>
		<a class="danger-link pressable" href={resolve(ROUTES.systemSettingsDanger)}
			>Delete all local data</a
		>
	</section>
</main>

<style>
	.screen {
		flex: 1;
	}

	.status__title {
		margin: 0 0 var(--s-3);
		font-size: var(--t-body-lg);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.status__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-bottom: var(--s-4);
	}

	.status__rows {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
	}

	.status__rows div {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
		font-size: var(--t-footnote);
	}

	.status__rows dt {
		color: var(--h-text-muted);
		margin: 0;
	}

	.status__rows dd {
		margin: 0;
		color: var(--h-text);
		font-weight: var(--weight-medium);
		text-align: right;
	}

	.danger-zone {
		margin-top: var(--s-6);
	}

	.danger-zone__title {
		margin: 0 0 var(--s-2);
		font-size: var(--t-body-lg);
		color: var(--h-red);
	}

	.danger-zone__sub {
		margin: 0 0 var(--s-3);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.danger-link {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 52px;
		border-radius: var(--r-pill);
		background: var(--h-red-soft);
		border: 1px solid var(--h-red-line);
		color: var(--h-red);
		font-weight: var(--weight-semibold);
		text-decoration: none;
	}
</style>
