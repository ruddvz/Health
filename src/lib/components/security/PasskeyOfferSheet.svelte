<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import { validatePinFormat } from '$lib/security/crypto';
	import { createRecoveryCodeSet } from '$lib/security/recoveryCodes';
	import { isPlatformAuthenticatorAvailable } from '$lib/security/rpOrigin';
	import { enablePasskeyLock } from '$lib/stores/healthLock';

	interface Props {
		ondecline: () => void;
	}
	let { ondecline }: Props = $props();

	let busy = $state(false);
	let error = $state<string | null>(null);
	let recoveryPin = $state('');
	let bioOk = $state(false);
	let codesShown = $state<string[] | null>(null);

	$effect(() => {
		void isPlatformAuthenticatorAvailable().then((v) => {
			bioOk = v;
		});
	});

	async function enable() {
		busy = true;
		error = null;
		const pinErr = validatePinFormat(recoveryPin.trim());
		if (pinErr) {
			error = pinErr;
			busy = false;
			return;
		}
		const { codes, configHashes } = await createRecoveryCodeSet();
		const r = await enablePasskeyLock({
			recoveryPin: recoveryPin.trim(),
			recoveryCodeHashes: configHashes,
			keepUnlocked: true
		});
		busy = false;
		if (!r.ok) {
			error = r.error;
			return;
		}
		codesShown = codes;
	}

	function continueToApp() {
		goto(resolve('/today'));
	}
</script>

<BottomSheet open={true} title="Protect your health plan" onClose={ondecline}>
	<p class="body">
		Use Face ID, Touch ID, Windows Hello, or your device passcode to unlock this app. Your plan
		stays on this device and is encrypted on-device. Health does not upload your meals, weight,
		supplements, or progress data.
	</p>

	{#if error}
		<p class="err" role="alert">{error}</p>
	{/if}

	{#if codesShown}
		<p class="lab">Save these recovery codes (shown once)</p>
		<ul class="codes">
			{#each codesShown as c (c)}
				<li>{c}</li>
			{/each}
		</ul>
	{:else}
		<label class="field">
			<span class="field-label">Recovery PIN (required, 4–8 digits)</span>
			<input
				class="inp"
				type="password"
				inputmode="numeric"
				maxlength="8"
				placeholder="Decrypts your plan on this device"
				bind:value={recoveryPin}
				disabled={busy}
			/>
		</label>
		<p class="hint">
			Required for encrypted storage. Passkey unlocks the app; PIN loads encrypted data.
		</p>
		<a class="link" href={resolve('/system/security')}>Security settings</a>
	{/if}

	{#snippet footer()}
		{#if codesShown}
			<HealthButton variant="primary" block onclick={continueToApp}>Continue to app</HealthButton>
		{:else}
			<HealthButton variant="primary" block disabled={busy || !bioOk} onclick={enable}>
				{bioOk ? 'Protect with passkey' : 'Passkey not available on this device'}
			</HealthButton>
			<HealthButton variant="ghost" block disabled={busy} onclick={ondecline}>Not now</HealthButton>
		{/if}
	{/snippet}
</BottomSheet>

<style>
	.body {
		margin: 0 0 var(--s-4);
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.hint {
		margin: 0 0 var(--s-3);
		font-size: var(--t-caption);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.err {
		color: var(--h-red);
		font-size: var(--t-footnote);
		margin-bottom: var(--s-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: var(--s-3);
	}

	.field-label {
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-muted);
	}

	.inp {
		min-height: 52px;
		padding: 0 15px;
		border-radius: var(--r-control);
		border: 1px solid var(--h-line);
		background: var(--input-bg);
		color: var(--h-text);
		font-size: var(--t-body);
	}

	.link {
		display: block;
		margin-top: var(--s-4);
		text-align: center;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.codes {
		margin: 0 0 var(--s-4);
		padding-left: var(--s-4);
		font-size: var(--t-caption);
		font-family: var(--font-mono);
		letter-spacing: 0.06em;
	}

	.lab {
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-muted);
		margin-bottom: var(--s-2);
	}
</style>
