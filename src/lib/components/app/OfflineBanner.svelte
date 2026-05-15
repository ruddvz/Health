<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	const pingUrl = `${base ? `${base.replace(/\/$/, '')}/` : '/'}_app/version.json`;

	let navigatorOnline = $state(browser ? navigator.onLine : true);
	let reachOk = $state(true);
	let consecutiveFails = 0;

	function onOnline() {
		navigatorOnline = true;
		void probe();
	}
	function onOffline() {
		navigatorOnline = false;
		reachOk = false;
		consecutiveFails = 0;
	}

	async function probe() {
		if (!browser || !navigator.onLine) return;
		try {
			const res = await fetch(pingUrl, {
				cache: 'no-store',
				signal: AbortSignal.timeout(4500)
			});
			if (res.ok) {
				consecutiveFails = 0;
				reachOk = true;
			} else {
				consecutiveFails += 1;
				if (consecutiveFails >= 2) reachOk = false;
			}
		} catch {
			consecutiveFails += 1;
			if (consecutiveFails >= 2) reachOk = false;
		}
	}

	const showBanner = $derived(!navigatorOnline || (navigatorOnline && !reachOk));

	onMount(() => {
		if (!browser) return;

		void probe();

		const interval = window.setInterval(() => void probe(), 60_000);
		const onVis = () => {
			if (document.visibilityState === 'visible') void probe();
		};
		document.addEventListener('visibilitychange', onVis);

		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', onVis);
		};
	});
</script>

<svelte:window ononline={onOnline} onoffline={onOffline} />

{#if showBanner}
	<div class="banner mono-caps" role="status">
		{#if !navigatorOnline}
			Network offline — plan data stays on device
		{:else}
			Can’t reach this site — plan data stays on device. Check connection, then try again.
		{/if}
	</div>
{/if}

<style>
	.banner {
		margin: 0;
		padding: var(--space-2) var(--space-4);
		text-align: center;
		background: var(--warning);
		color: #0b0b0b;
		font-size: 10px;
		letter-spacing: 0.12em;
	}
</style>
