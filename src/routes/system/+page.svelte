<script lang="ts">
	import { ROUTES } from '$lib/appRoutes';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SectionLabel from '$lib/components/spec/SectionLabel.svelte';
	import SettingsRowLink from '$lib/components/spec/SettingsRowLink.svelte';
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="SYSTEM" />

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
		subtitle="Version 0.0.1 · Local PWA"
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
</style>
