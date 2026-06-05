<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type InstallableEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: string }>;
	};

	let closeInstallHint = $state(false);
	let dismissUpdate = $state(false);

	let deferred: InstallableEvent | null = null;
	let canInstall = $state(false);
	let userEngaged = $state(false);
	let delayElapsed = $state(false);

	let updateAvailable = $state(false);
	let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;

	const showInstallUi = $derived(canInstall && !closeInstallHint && (userEngaged || delayElapsed));
	const showUpdateUi = $derived(updateAvailable && !dismissUpdate);

	onMount(() => {
		if (!browser) return;

		let swUpdateInterval: ReturnType<typeof setInterval> | undefined;

		const delayTimer = window.setTimeout(() => {
			delayElapsed = true;
		}, 12_000);

		function onFirstEngagement() {
			userEngaged = true;
			window.removeEventListener('pointerdown', onFirstEngagement, true);
		}
		window.addEventListener('pointerdown', onFirstEngagement, true);

		function onBip(e: Event) {
			e.preventDefault();
			deferred = e as InstallableEvent;
			canInstall = true;
		}
		window.addEventListener('beforeinstallprompt', onBip);

		import('virtual:pwa-register')
			.then(({ registerSW }) => {
				applyUpdate = registerSW({
					immediate: true,
					onNeedRefresh() {
						updateAvailable = true;
					},
					onOfflineReady() {},
					onRegisteredSW(_url, registration) {
						if (!registration) return;
						if (swUpdateInterval) clearInterval(swUpdateInterval);
						swUpdateInterval = setInterval(() => void registration.update(), 4 * 60 * 60 * 1000);
					}
				});
			})
			.catch(() => {});

		return () => {
			if (swUpdateInterval) clearInterval(swUpdateInterval);
			clearTimeout(delayTimer);
			window.removeEventListener('pointerdown', onFirstEngagement, true);
			window.removeEventListener('beforeinstallprompt', onBip);
		};
	});

	async function installClick() {
		if (!deferred) return;
		deferred.prompt();
		await deferred.userChoice;
		deferred = null;
		canInstall = false;
	}

	async function refreshApp() {
		if (applyUpdate) await applyUpdate(true);
		updateAvailable = false;
		dismissUpdate = false;
	}
</script>

{#if showUpdateUi}
	<div class="toast update card" role="status" aria-live="polite">
		<p class="title">Update ready</p>
		<p class="sub">A newer version is available. Refresh to load it.</p>
		<div class="row">
			<button type="button" class="primary pressable" onclick={refreshApp}>Refresh</button>
			<button type="button" class="ghost pressable" onclick={() => (dismissUpdate = true)}
				>Later</button
			>
		</div>
	</div>
{/if}

{#if showInstallUi}
	<div class="toast install card" class:below-update={showUpdateUi}>
		<p class="title">Add to Home Screen</p>
		<p class="sub">On iPhone: tap Share, then “Add to Home Screen” for full-screen use.</p>
		<div class="row">
			<button type="button" class="primary pressable" onclick={installClick}>Install</button>
			<button type="button" class="ghost pressable" onclick={() => (closeInstallHint = true)}
				>Later</button
			>
		</div>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 16px;
		right: 16px;
		bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px);
		z-index: 50;
		padding: var(--s-4);
		max-width: 400px;
		margin-inline: auto;
	}

	.update {
		z-index: 51;
	}

	.install.below-update {
		bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 148px);
	}

	.title {
		margin: 0 0 var(--s-2);
		font-size: var(--t-body-lg);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.sub {
		margin: 0 0 var(--s-3);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.row {
		display: flex;
		gap: var(--s-2);
	}

	.primary {
		flex: 1;
		min-height: 48px;
		padding: 0 var(--s-4);
		border: 1px solid rgba(167, 255, 106, 0.28);
		border-radius: var(--r-pill);
		background: linear-gradient(180deg, rgba(167, 255, 106, 0.95), rgba(112, 242, 166, 0.86));
		color: #081008;
		font-weight: 760;
		cursor: pointer;
	}

	.ghost {
		min-height: 48px;
		padding: 0 var(--s-4);
		border: 1px solid var(--h-line-strong);
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--h-text-muted);
		font-weight: 650;
		cursor: pointer;
	}
</style>
