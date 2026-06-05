<script lang="ts">
	import { focusTrap } from '$lib/a11y/focusTrap';
	import { resolve } from '$app/paths';
	import PinPad from '$lib/components/security/PinPad.svelte';
	import {
		needsPinToDecryptVault,
		securityConfig,
		unlockWithBiometric,
		unlockWithPin,
		unlockWithRecoveryCode
	} from '$lib/stores/healthLock';
	import { pinLockoutMessage } from '$lib/security/pinRateLimit';
	import { isPlatformAuthenticatorAvailable } from '$lib/security/rpOrigin';

	let pin = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
	let mode = $state<'pin' | 'recovery'>('pin');
	let recoveryInput = $state('');
	let bioAvailable = $state(false);

	$effect(() => {
		void isPlatformAuthenticatorAvailable().then((v) => {
			bioAvailable = v;
		});
	});

	const showPin = $derived(
		$securityConfig.method === 'pin' || $securityConfig.method === 'pin+biometric'
	);
	const showBio = $derived(
		bioAvailable &&
			($securityConfig.method === 'biometric' || $securityConfig.method === 'pin+biometric')
	);

	async function submitPin() {
		const lockMsg = pinLockoutMessage();
		if (lockMsg) {
			error = lockMsg;
			return;
		}
		if (pin.length < 4) {
			error = 'Enter your full PIN.';
			return;
		}
		busy = true;
		error = null;
		const err = await unlockWithPin(pin);
		busy = false;
		if (err) {
			error = err;
			pin = '';
		}
	}

	async function tryBio() {
		busy = true;
		error = null;
		const err = await unlockWithBiometric();
		busy = false;
		if (err) error = err;
	}

	async function submitRecovery() {
		busy = true;
		error = null;
		const err = await unlockWithRecoveryCode(recoveryInput);
		busy = false;
		if (err) error = err;
		else recoveryInput = '';
	}
</script>

<div class="gate" use:focusTrap role="dialog" aria-modal="true" aria-labelledby="lock-title">
	<div class="inner health-card">
		<div class="mark" aria-hidden="true">H</div>
		<p class="kicker">Health Lock</p>
		<h1 id="lock-title" class="title">Unlock Health</h1>
		<p class="sub">Your plan is protected on this device.</p>

		{#if error}
			<p class="err" role="alert">{error}</p>
		{/if}
		{#if needsPinToDecryptVault()}
			<p class="hint">Enter your recovery PIN to load encrypted plan data.</p>
		{/if}

		{#if mode === 'recovery'}
			<label class="field">
				<span class="field-label">Recovery code</span>
				<input
					class="inp"
					type="text"
					autocomplete="off"
					spellcheck={false}
					placeholder="XXXX-XXXX"
					bind:value={recoveryInput}
					disabled={busy}
				/>
			</label>
			<button type="button" class="primary pressable" disabled={busy} onclick={submitRecovery}>
				Unlock with code
			</button>
			<button
				type="button"
				class="link pressable"
				disabled={busy}
				onclick={() => {
					mode = 'pin';
					error = null;
				}}>Back to PIN / Face ID</button
			>
		{:else}
			{#if showBio}
				<button type="button" class="bio pressable" disabled={busy} onclick={tryBio}>
					Unlock with passkey
				</button>
			{/if}
			{#if showPin}
				<PinPad bind:value={pin} maxLength={8} disabled={busy} oncomplete={submitPin} />
				<button type="button" class="primary pressable" disabled={busy} onclick={submitPin}>
					Unlock with PIN
				</button>
			{/if}
			{#if $securityConfig.recoveryCodeHashes.length > 0}
				<button
					type="button"
					class="link pressable"
					disabled={busy}
					onclick={() => {
						mode = 'recovery';
						error = null;
						pin = '';
					}}>Use a recovery code</button
				>
			{/if}
		{/if}

		<a class="setup-link" href={resolve('/system/security')}>Security settings</a>
	</div>
</div>

<style>
	.gate {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--s-4);
		background: var(--modal-scrim);
		backdrop-filter: blur(var(--blur-sheet));
		-webkit-backdrop-filter: blur(var(--blur-sheet));
	}

	.inner {
		width: min(400px, 100%);
		padding: var(--s-6) var(--s-5);
		text-align: center;
	}

	.mark {
		width: 52px;
		height: 52px;
		margin: 0 auto var(--s-4);
		display: grid;
		place-items: center;
		border-radius: var(--r-control);
		background: var(--h-accent);
		color: var(--health-primary-text);
		font-weight: var(--weight-bold);
		font-size: var(--t-title-3);
		box-shadow: var(--shadow-glow);
	}

	.kicker {
		margin: 0;
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.title {
		margin: var(--s-2) 0;
		font-size: var(--t-title-1);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--h-text);
	}

	.sub {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}

	.hint {
		margin: 0 0 var(--s-3);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.err {
		margin: 0 0 var(--s-3);
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		background: var(--h-red-soft);
		border: 1px solid var(--h-red-line);
		font-size: var(--t-footnote);
		color: var(--h-red);
	}

	.bio {
		width: 100%;
		min-height: 52px;
		margin-bottom: var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--health-purple);
		background: var(--health-purple-soft);
		color: var(--health-purple);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}

	.primary {
		width: 100%;
		min-height: 48px;
		margin-top: var(--s-3);
		border-radius: var(--r-pill);
		border: none;
		background: var(--h-accent);
		color: var(--health-primary-text);
		font-weight: var(--weight-semibold);
		cursor: pointer;
		box-shadow: var(--shadow-glow);
	}

	.link {
		display: block;
		width: 100%;
		min-height: 44px;
		margin-top: var(--s-3);
		padding: var(--s-2);
		border: none;
		background: transparent;
		color: var(--h-text-muted);
		font-size: var(--t-footnote);
		cursor: pointer;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		margin-bottom: var(--s-3);
		text-align: left;
	}

	.field-label {
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.inp {
		padding: var(--s-3);
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-line);
		background: var(--input-bg);
		color: var(--h-text);
		font-size: var(--t-body);
		letter-spacing: 0.08em;
	}

	.setup-link {
		display: block;
		margin-top: var(--s-5);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		text-align: center;
	}
</style>
