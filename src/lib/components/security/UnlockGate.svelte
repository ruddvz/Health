<script lang="ts">
	import { resolve } from '$app/paths';
	import PinPad from '$lib/components/security/PinPad.svelte';
	import {
		securityConfig,
		unlockWithBiometric,
		unlockWithPin,
		unlockWithRecoveryCode
	} from '$lib/stores/healthLock';
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

	const showPin = $derived($securityConfig.method === 'pin' || $securityConfig.method === 'pin+biometric');
	const showBio = $derived(
		bioAvailable &&
			($securityConfig.method === 'biometric' || $securityConfig.method === 'pin+biometric')
	);

	async function submitPin() {
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

<div class="gate" role="dialog" aria-modal="true" aria-labelledby="lock-title">
	<div class="inner nothing-surface">
		<p class="mono-caps kicker">Health Lock</p>
		<h1 id="lock-title" class="title">Unlock</h1>
		<p class="sub">Your plan and logs stay on this device. Authenticate to continue.</p>

		{#if error}
			<p class="err" role="alert">{error}</p>
		{/if}

		{#if mode === 'recovery'}
			<label class="field">
				<span class="mono-caps">Recovery code</span>
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
					Use Face ID / Touch ID
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
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: rgba(0, 0, 0, 0.88);
		backdrop-filter: blur(12px);
	}

	.inner {
		width: min(400px, 100%);
		padding: var(--space-5);
		border: 1px solid var(--line-1);
	}

	.kicker {
		margin: 0;
		font-size: 9px;
		color: var(--text-3);
	}

	.title {
		margin: var(--space-2) 0;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.sub {
		margin: 0 0 var(--space-4);
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.err {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		color: var(--red);
	}

	.bio {
		width: 100%;
		min-height: 52px;
		margin-bottom: var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid var(--red-line);
		background: rgba(255, 42, 42, 0.12);
		color: var(--red);
		font-weight: 650;
		cursor: pointer;
	}

	.primary {
		width: 100%;
		min-height: 48px;
		margin-top: var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-weight: 650;
		cursor: pointer;
	}

	.link {
		display: block;
		width: 100%;
		margin-top: var(--space-3);
		padding: 8px;
		border: none;
		background: transparent;
		color: var(--text-2);
		font-size: 14px;
		cursor: pointer;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: var(--space-3);
	}

	.inp {
		padding: 10px 12px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-1);
		background: rgba(0, 0, 0, 0.35);
		color: var(--text-1);
		font-size: 16px;
		letter-spacing: 0.08em;
	}

	.setup-link {
		display: block;
		margin-top: var(--space-5);
		font-size: 13px;
		color: var(--text-3);
		text-align: center;
	}
</style>
