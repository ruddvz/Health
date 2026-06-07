<script lang="ts">
	import { browser } from '$app/environment';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import { validatePinFormat } from '$lib/security/crypto';
	import { createRecoveryCodeSet } from '$lib/security/recoveryCodes';
	import CloudAccountPanel from '$lib/components/security/CloudAccountPanel.svelte';
	import { getPasskeyServerCapability } from '$lib/security/passkeyServer';
	import { configuredOrigin, configuredRpId, deploymentMode } from '$lib/security/domainConfig';
	import {
		getRelyingPartyInfo,
		isPlatformAuthenticatorAvailable,
		isWebAuthnAvailable
	} from '$lib/security/rpOrigin';
	import { registerPlatformLock } from '$lib/security/webauthnLocal';
	import { lockSetupIncompleteMessage } from '$lib/security/setupValidation';
	import type { HealthSecurityConfig, LockMethod } from '$lib/security/types';
	import {
		enablePinLock,
		lockNow,
		persistSecurity,
		removePasskeyFromDevice,
		securityConfig
	} from '$lib/stores/healthLock';
	import { get } from 'svelte/store';

	const serverCap = getPasskeyServerCapability();
	const rp = browser ? getRelyingPartyInfo() : null;

	let bioAvailable = $state(false);
	let setupPin = $state('');
	let setupPinConfirm = $state('');
	let statusMsg = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);
	let pendingRecoveryCodes = $state<string[] | null>(null);
	let autoLock = $state(5);
	let lockOnColdStart = $state(true);

	$effect(() => {
		const c = $securityConfig;
		autoLock = c.autoLockMinutes;
		lockOnColdStart = c.lockOnColdStart;
	});

	$effect(() => {
		if (!browser) return;
		void isPlatformAuthenticatorAvailable().then((v) => {
			bioAvailable = v;
		});
	});

	function methodLabel(m: LockMethod): string {
		switch (m) {
			case 'pin':
				return 'PIN';
			case 'biometric':
				return 'Face ID / Touch ID';
			case 'pin+biometric':
				return 'PIN + biometrics';
			case 'none':
			default:
				return 'Off';
		}
	}

	async function savePinSetup() {
		errorMsg = null;
		statusMsg = null;
		const errFmt = validatePinFormat(setupPin);
		if (errFmt) {
			errorMsg = errFmt;
			return;
		}
		if (setupPin !== setupPinConfirm) {
			errorMsg = 'PINs do not match.';
			return;
		}
		const cur = get(securityConfig);
		if (cur.recoveryCodeHashes.length < 1) {
			errorMsg = 'Generate recovery codes before saving your PIN.';
			return;
		}
		const r = await enablePinLock({
			recoveryPin: setupPin,
			recoveryCodeHashes: cur.recoveryCodeHashes,
			withPasskey: !!cur.webauthn,
			keepUnlocked: true
		});
		if (!r.ok) {
			errorMsg = r.error;
			return;
		}
		setupPin = '';
		setupPinConfirm = '';
		statusMsg = 'Recovery PIN saved. Plan data is encrypted on this device.';
	}

	async function enableBiometric() {
		errorMsg = null;
		statusMsg = null;
		const cur = get(securityConfig);
		const incomplete = lockSetupIncompleteMessage(cur);
		if (incomplete && !cur.webauthn) {
			errorMsg = incomplete;
			return;
		}
		if (!isWebAuthnAvailable()) {
			errorMsg = 'WebAuthn is not supported in this browser.';
			return;
		}
		if (!bioAvailable) {
			errorMsg = 'No platform authenticator (Face ID / Touch ID) was detected.';
			return;
		}
		if (!cur.pin || cur.recoveryCodeHashes.length < 1) {
			errorMsg = 'Set recovery PIN and generate recovery codes before adding a passkey.';
			return;
		}
		const reg = await registerPlatformLock('local');
		if (!reg.ok) {
			errorMsg = reg.error;
			return;
		}
		const next: HealthSecurityConfig = {
			...cur,
			enabled: true,
			webauthn: reg.meta,
			method: 'pin+biometric'
		};
		persistSecurity(next, { keepUnlocked: true });
		statusMsg = 'Passkey enabled on this device.';
	}

	async function generateRecovery() {
		errorMsg = null;
		const { codes, configHashes } = await createRecoveryCodeSet();
		const cur = get(securityConfig);
		persistSecurity({ ...cur, recoveryCodeHashes: configHashes }, { keepUnlocked: true });
		pendingRecoveryCodes = codes;
		statusMsg = 'Save these codes now — they will not be shown again.';
	}

	function saveAutoLockSettings() {
		const cur = get(securityConfig);
		persistSecurity(
			{
				...cur,
				autoLockMinutes: autoLock,
				lockOnColdStart
			},
			{ keepUnlocked: true }
		);
		statusMsg = 'Auto-lock settings saved.';
	}

	function removePasskey() {
		const ok = window.confirm(
			'Remove the passkey registered on this device? You can still use your recovery PIN if set.'
		);
		if (!ok) return;
		removePasskeyFromDevice();
		statusMsg = 'Passkey removed from this device.';
	}

	function disableLock() {
		const ok = window.confirm('Turn off Health Lock on this device?');
		if (!ok) return;
		persistSecurity({
			...get(securityConfig),
			enabled: false,
			method: 'none',
			pin: undefined,
			webauthn: undefined
		});
		statusMsg = 'Health Lock disabled.';
	}

	function lockScreenNow() {
		lockNow();
		statusMsg = 'Locked. Navigate to a protected screen to test unlock.';
	}

	function copyRecoveryCodes() {
		if (!pendingRecoveryCodes) return;
		const text = pendingRecoveryCodes.join('\n');
		void navigator.clipboard.writeText(text);
		statusMsg = 'Recovery codes copied to clipboard.';
	}
</script>

<main class="screen px-screen pt-safe stack">
	<ScreenHeaderBlock title="Security" subtitle="Protect your health plan on this device" />

	<section class="block nothing-surface hero">
		<h2 class="title">Local Health Lock</h2>
		<p class="p">
			Health Lock keeps your plan private on this device. It works offline with Face ID, Touch ID,
			or a recovery PIN. It is not a medical security system and does not upload your plan by
			itself.
		</p>
		<p class="p muted">
			Cloud Passkey Account (below) is optional and only for encrypted backup when a backend is
			configured. You do not need it for everyday local PWA use.
		</p>
	</section>

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Status</h2>
		<p class="p">
			<strong>{methodLabel($securityConfig.method)}</strong>
			{#if $securityConfig.enabled}
				— protected routes require unlock.
			{:else}
				— anyone with this device can open your plan.
			{/if}
		</p>
		<p class="p muted">
			Recovery codes on file: {$securityConfig.recoveryCodeHashes.length}
		</p>
	</section>

	{#if rp?.warning}
		<section class="warn nothing-surface">
			<p class="p">{rp.warning}</p>
			<p class="mono-caps sub">Origin: {rp.origin} · RP ID: {rp.rpId}</p>
		</section>
	{/if}

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Enable passkey lock</h2>
		<p class="p">
			Uses your device’s platform authenticator. This is a privacy screen for your local PWA — not
			the same as a server-synced passkey backed by a cloud account.
		</p>
		<button type="button" class="btn pressable" disabled={!bioAvailable} onclick={enableBiometric}>
			{bioAvailable ? 'Enable passkey on this device' : 'Passkey not available in this browser'}
		</button>
	</section>

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Change recovery PIN</h2>
		<p class="p">4–8 digit PIN stored as a salted hash on this device only.</p>
		<label class="field">
			<span class="mono-caps">New PIN</span>
			<input class="inp" type="password" inputmode="numeric" maxlength="8" bind:value={setupPin} />
		</label>
		<label class="field">
			<span class="mono-caps">Confirm PIN</span>
			<input
				class="inp"
				type="password"
				inputmode="numeric"
				maxlength="8"
				bind:value={setupPinConfirm}
			/>
		</label>
		<button type="button" class="btn pressable" onclick={savePinSetup}>Save PIN</button>
	</section>

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Recovery codes</h2>
		<p class="p">One-time codes if you forget your PIN or lose biometrics access.</p>
		<button type="button" class="btn pressable" onclick={generateRecovery}>
			Generate new recovery codes
		</button>
		{#if pendingRecoveryCodes}
			<ul class="codes">
				{#each pendingRecoveryCodes as code (code)}
					<li class="mono-caps">{code}</li>
				{/each}
			</ul>
			<button type="button" class="btn secondary pressable" onclick={copyRecoveryCodes}>
				Copy all codes
			</button>
		{/if}
	</section>

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Auto-lock</h2>
		<label class="field">
			<span class="mono-caps">Lock after (minutes)</span>
			<select class="inp" bind:value={autoLock}>
				<option value={0}>Immediately when app is hidden</option>
				<option value={1}>1 minute</option>
				<option value={5}>5 minutes</option>
				<option value={15}>15 minutes</option>
				<option value={-1}>Never (manual lock only)</option>
			</select>
		</label>
		<label class="row-check">
			<input type="checkbox" bind:checked={lockOnColdStart} />
			<span>Require unlock when reopening the app</span>
		</label>
		<button type="button" class="btn pressable" onclick={saveAutoLockSettings}
			>Save auto-lock</button
		>
	</section>

	<CloudAccountPanel />

	<section class="block nothing-surface">
		<h2 class="mono-caps h">Deployment notes</h2>
		<p class="p">
			Mode: <strong>{deploymentMode()}</strong>
			{#if configuredRpId()}
				· Configured RP: <code>{configuredRpId()}</code>{/if}
			{#if configuredOrigin()}
				· Origin: <code>{configuredOrigin()}</code>{/if}
		</p>
		<p class="p">{serverCap.available ? 'Cloud API ready.' : serverCap.reason}</p>
	</section>

	{#if statusMsg}
		<p class="status">{statusMsg}</p>
	{/if}
	{#if errorMsg}
		<p class="error" role="alert">{errorMsg}</p>
	{/if}

	{#if $securityConfig.webauthn}
		<button type="button" class="btn secondary pressable" onclick={removePasskey}>
			Remove passkey from this device
		</button>
	{/if}

	<p class="mono-caps lab">Actions</p>
	<button type="button" class="btn secondary pressable" onclick={lockScreenNow}>Lock now</button>
	{#if $securityConfig.enabled}
		<button type="button" class="btn danger pressable" onclick={disableLock}
			>Turn off Health Lock</button
		>
	{/if}
</main>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.hero .title {
		margin: 0 0 var(--space-2);
		font-size: 18px;
		font-weight: 700;
	}

	.block,
	.warn {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
		border: 1px solid var(--line-1);
	}

	.warn {
		border-color: rgba(255, 180, 0, 0.35);
	}

	.h {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
	}

	.p {
		margin: 0 0 var(--space-2);
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.p.muted,
	.sub {
		font-size: 11px;
		color: var(--text-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: var(--space-3) 0;
	}

	.inp {
		padding: 10px 12px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-1);
		background: rgba(0, 0, 0, 0.35);
		color: var(--text-1);
		font-size: 15px;
	}

	.btn {
		width: 100%;
		min-height: 48px;
		margin-top: var(--space-2);
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-weight: 650;
		cursor: pointer;
	}

	.btn.secondary {
		background: transparent;
	}

	.btn.danger {
		border-color: var(--red-line);
		color: var(--red);
		background: rgba(255, 42, 42, 0.1);
	}

	.row-check {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: var(--space-2) 0;
		font-size: 14px;
		color: var(--text-2);
	}

	.codes {
		margin: var(--space-3) 0 0;
		padding-left: var(--space-4);
		font-size: 13px;
		letter-spacing: 0.06em;
	}

	.status {
		color: var(--text-2);
		font-size: 14px;
	}

	.error {
		color: var(--h-red);
		font-size: 14px;
	}

	.lab {
		margin-top: var(--space-4);
		font-size: 10px;
		color: var(--text-3);
	}
</style>
