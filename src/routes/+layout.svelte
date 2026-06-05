<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import '$lib/styles/global.css';
	import '$lib/styles/theme-light.css';
	import '$lib/styles/nothing.css';
	import '$lib/styles/utilities.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/app/AppShell.svelte';
	import InstallPrompt from '$lib/components/app/InstallPrompt.svelte';
	import ToastHost from '$lib/components/app/ToastHost.svelte';
	import UnlockGate from '$lib/components/security/UnlockGate.svelte';
	import { normalizePathname } from '$lib/paths';
	import { isLockProtectedPath } from '$lib/security/routeLock';
	import { syncThemeFromSettings } from '$lib/theme';
	import StorageRecoveryBanner from '$lib/components/app/StorageRecoveryBanner.svelte';
	import { hydrateFromLocalStorage, planParseError, settings } from '$lib/stores/healthApp';
	import {
		hydrateSecurity,
		lockOnHidden,
		requiresUnlock,
		touchSession
	} from '$lib/stores/healthLock';

	let { children } = $props();

	onMount(() => {
		void hydrateFromLocalStorage().then(() => syncThemeFromSettings());
		hydrateSecurity();

		const onHide = () => lockOnHidden();
		const onVis = () => {
			if (document.visibilityState === 'hidden') lockOnHidden();
			else touchSession();
		};
		window.addEventListener('pagehide', onHide);
		document.addEventListener('visibilitychange', onVis);
		return () => {
			window.removeEventListener('pagehide', onHide);
			document.removeEventListener('visibilitychange', onVis);
		};
	});

	$effect(() => {
		syncThemeFromSettings($settings);
	});

	const path = $derived(normalizePathname(page.url.pathname));
	const showNav = $derived(path !== '/' && path !== '/import');
	const gated = $derived(isLockProtectedPath(path) && $requiresUnlock);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={`${base}/icons/apple-touch-icon.png`} />
	<link rel="apple-touch-icon" href={`${base}/icons/icon-192.png`} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="theme-color" content="#f7f4ee" />
	<meta
		name="description"
		content="Your private daily health plan — meals, training, and progress on your iPhone."
	/>
	<title>Health — Personal Plan</title>
</svelte:head>

{#if $planParseError}
	<StorageRecoveryBanner message={$planParseError} />
{/if}
<AppShell {showNav}>
	{#if gated}
		<UnlockGate />
	{:else}
		{@render children()}
	{/if}
</AppShell>
<InstallPrompt />
<ToastHost />
