<script lang="ts">
	import { ROUTES } from '$lib/appRoutes';
	import { resolve } from '$app/paths';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SettingsRowLink from '$lib/components/spec/SettingsRowLink.svelte';

	const version = '0.0.1';
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="ABOUT" subtitle="Health — personal plan PWA" />

	<section class="block nothing-surface">
		<p class="mono-caps lab">Version</p>
		<p class="val">{version}</p>
		<p class="mono-caps lab">Offline</p>
		<p class="body">
			This app is a static PWA. Your plan and logs stay in browser storage unless you enable Health
			Lock encryption or optional cloud backup.
		</p>
		<p class="mono-caps lab">Updates</p>
		<p class="body">
			After a deploy, reload once if the UI looks stale — the service worker may need a moment to
			pick up new assets.
		</p>
	</section>

	<SettingsRowLink
		icon="DX"
		title="Plan diagnostics"
		subtitle="Schema warnings and import checks"
		href={ROUTES.systemDiagnostics}
	/>
	<SettingsRowLink
		icon="LOCK"
		title="Privacy"
		subtitle="What stays on your device"
		href={ROUTES.systemPrivacy}
	/>
</main>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.block {
		padding: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.lab {
		margin: var(--space-3) 0 var(--space-1);
		font-size: 9px;
		color: var(--text-3);
	}

	.lab:first-child {
		margin-top: 0;
	}

	.val {
		margin: 0;
		font-size: 22px;
		font-weight: 650;
		color: var(--text-1);
	}

	.body {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}
</style>
