<script lang="ts">
	import { onMount } from 'svelte';
	import { ROUTES } from '$lib/appRoutes';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import SettingsRowLink from '$lib/components/spec/SettingsRowLink.svelte';
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
				return 'Active — offline shell after first visit';
			case 'pending':
				return 'Registering…';
			case 'unsupported':
				return 'Not supported';
			default:
				return 'Not registered yet';
		}
	});
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="SYSTEM" />

	<SectionLabel text="APP STATUS" />
	<section class="status nothing-surface" aria-live="polite">
		<div class="row">
			<span class="lab">Version</span>
			<span class="val">{pwa?.version ?? '—'}</span>
		</div>
		<div class="row">
			<span class="lab">Installed as PWA</span>
			<span class="val">{pwa?.standalone ? 'Yes' : 'No'}</span>
		</div>
		<div class="row">
			<span class="lab">Service worker</span>
			<span class="val">{swLabel}</span>
		</div>
		{#if storage}
			<div class="row">
				<span class="lab">Storage used</span>
				<span class="val"
					>{storage.usageLabel} / {storage.quotaLabel}{storage.percent != null
						? ` (${storage.percent}%)`
						: ''}</span
				>
			</div>
		{/if}
	</section>

	<SectionLabel text="PRIVACY & DATA" />
	<SettingsRowLink
		icon="KEY"
		title="Health Lock"
		subtitle="PIN, Face ID, recovery codes"
		href={ROUTES.systemSecurity}
	/>
	<SettingsRowLink
		icon="LOCK"
		title="100% Local"
		subtitle="Everything is stored on this device."
		href={ROUTES.systemPrivacy}
	/>
	<SettingsRowLink
		icon="OUT"
		title="Export Progress"
		subtitle="Weight, check-ins, workouts"
		href={ROUTES.systemSettingsProgressExport}
	/>
	<SettingsRowLink
		icon="OUT"
		title="Export Plan"
		subtitle="Save a backup of your plan."
		href={ROUTES.systemSettingsExport}
	/>
	<SettingsRowLink
		icon="DEL"
		title="Delete Local Data"
		subtitle="Remove all app data permanently."
		tone="danger"
		href={ROUTES.systemSettingsDanger}
	/>

	<SectionLabel text="APP" />
	<SettingsRowLink
		icon="OFF"
		title="Offline Ready"
		subtitle="Works fully without internet."
		href={ROUTES.systemAbout}
	/>
	<SettingsRowLink
		icon="DX"
		title="Plan Diagnostics"
		subtitle="Check plan health & issues."
		href={ROUTES.systemDiagnostics}
	/>
	<SettingsRowLink
		icon="i"
		title="About"
		subtitle="Version, PWA install, cache refresh"
		href={ROUTES.systemAbout}
	/>

	<SectionLabel text="TOOLS" />
	<SettingsRowLink
		icon="PH"
		title="Phases"
		subtitle="Targets and focus by phase"
		href={ROUTES.systemPhases}
	/>
	<SettingsRowLink
		icon="CART"
		title="Grocery"
		subtitle="Store checklist"
		href={ROUTES.systemGrocery}
	/>
	<SettingsRowLink icon="PREP" title="Prep" subtitle="Weekly prep steps" href={ROUTES.systemPrep} />
	<SettingsRowLink
		icon="PILL"
		title="Supplements"
		subtitle="Schedule & stack"
		href={ROUTES.systemSupplements}
	/>
</main>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.status {
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--line-1);
	}

	.row:last-child {
		border-bottom: none;
	}

	.lab {
		font-size: 13px;
		color: var(--text-3);
	}

	.val {
		font-size: 13px;
		color: var(--text-1);
		text-align: right;
		max-width: 58%;
		line-height: 1.4;
	}
</style>
