<script lang="ts">
	import { onMount } from 'svelte';
	import { ROUTES } from '$lib/appRoutes';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import SettingsRowLink from '$lib/components/spec/SettingsRowLink.svelte';
	import { isStandalonePwa } from '$lib/pwa/standalone';

	const version = '0.0.1';
	let standalone = $state(false);
	let swStatus = $state('Checking…');

	onMount(() => {
		standalone = isStandalonePwa();
		if (!('serviceWorker' in navigator)) {
			swStatus = 'Not supported in this browser';
			return;
		}
		void navigator.serviceWorker.getRegistration().then((reg) => {
			swStatus = reg?.active
				? 'Active — offline shell available after first visit'
				: 'Not registered yet';
		});
	});

	function clearCacheAndReload() {
		if (
			!confirm(
				'Clear cached app files and reload? You will not lose your plan or progress stored in browser storage.'
			)
		) {
			return;
		}
		void caches
			.keys()
			.then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
			.finally(() => {
				location.reload();
			});
	}
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="ABOUT" subtitle="Health — personal plan PWA" />

	<section class="block nothing-surface">
		<p class="mono-caps lab">Version</p>
		<p class="val">{version}</p>
		<p class="mono-caps lab">Installed as PWA</p>
		<p class="body">
			{standalone ? 'Yes — running standalone' : 'No — open from Safari and Add to Home Screen'}
		</p>
		<p class="mono-caps lab">Service worker</p>
		<p class="body">{swStatus}</p>
		<p class="mono-caps lab">Offline</p>
		<p class="body">
			This app is a static PWA. Your plan and logs stay in browser storage unless you enable Health
			Lock encryption or optional cloud backup.
		</p>
		<p class="mono-caps lab">Updates</p>
		<p class="body">
			After a deploy, use the in-app update banner or tap Refresh below if the UI looks stale.
		</p>
		<button type="button" class="refresh pressable" onclick={clearCacheAndReload}>
			Clear app cache and reload
		</button>
	</section>

	{#if !standalone}
		<section class="install nothing-surface" aria-labelledby="ios-install-h">
			<h2 id="ios-install-h" class="install-title">Install on iPhone</h2>
			<ol class="install-steps">
				<li>Open this app in Safari.</li>
				<li>Tap Share.</li>
				<li>Tap Add to Home Screen.</li>
				<li>Open Health from your home screen.</li>
			</ol>
		</section>
	{/if}

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

	.block,
	.install {
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

	.refresh {
		margin-top: var(--space-4);
		width: 100%;
		min-height: 48px;
		padding: 12px 16px;
		border-radius: var(--radius-control, var(--radius-sm));
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}

	.install-title {
		margin: 0 0 var(--space-3);
		font-size: 17px;
		font-weight: 650;
		color: var(--text-1);
	}

	.install-steps {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-2);
	}

	.install-steps li {
		margin-bottom: var(--space-2);
	}
</style>
