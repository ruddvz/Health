<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createRecoveryCodeSet } from '$lib/security/recoveryCodes';
	import { isPlatformAuthenticatorAvailable } from '$lib/security/rpOrigin';
	import { enablePasskeyLock, persistSecurity, securityConfig } from '$lib/stores/healthLock';
	import { get } from 'svelte/store';

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
		const r = await enablePasskeyLock({
			recoveryPin: recoveryPin.trim() || undefined,
			keepUnlocked: true
		});
		busy = false;
		if (!r.ok) {
			error = r.error;
			return;
		}
		const { codes, configHashes } = await createRecoveryCodeSet();
		const cur = get(securityConfig);
		persistSecurity({ ...cur, recoveryCodeHashes: configHashes }, { keepUnlocked: true });
		codesShown = codes;
	}

	function continueToApp() {
		goto(resolve('/today'));
	}
</script>

<div class="sheet-wrap" role="dialog" aria-modal="true" aria-labelledby="offer-title">
	<div class="sheet nothing-surface">
		<h2 id="offer-title" class="title">Protect your health plan</h2>
		<p class="body">
			Use Face ID, Touch ID, Windows Hello, or your device passcode to unlock this app. Your plan
			stays on this device. Health does not upload your meals, weight, supplements, or progress data.
		</p>

		{#if error}
			<p class="err" role="alert">{error}</p>
		{/if}

		{#if codesShown}
			<p class="mono-caps lab">Save these recovery codes (shown once)</p>
			<ul class="codes">
				{#each codesShown as c (c)}
					<li>{c}</li>
				{/each}
			</ul>
			<button type="button" class="primary pressable" onclick={continueToApp}>Continue to app</button>
		{:else}
			<label class="field">
				<span class="mono-caps">Recovery PIN (optional, 4–8 digits)</span>
				<input
					class="inp"
					type="password"
					inputmode="numeric"
					maxlength="8"
					placeholder="If biometrics fail"
					bind:value={recoveryPin}
					disabled={busy}
				/>
			</label>
			<button
				type="button"
				class="primary pressable"
				disabled={busy || !bioOk}
				onclick={enable}
			>
				{bioOk ? 'Protect with passkey' : 'Passkey not available on this device'}
			</button>
			<button type="button" class="secondary pressable" disabled={busy} onclick={ondecline}>
				Not now
			</button>
			<a class="link" href={resolve('/system/security')}>Security settings</a>
		{/if}
	</div>
</div>

<style>
	.sheet-wrap {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: var(--space-4);
		background: rgba(0, 0, 0, 0.75);
	}

	.sheet {
		width: min(430px, 100%);
		padding: var(--space-5);
		border: 1px solid var(--line-1);
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	.title {
		margin: 0 0 var(--space-3);
		font-size: 22px;
		font-weight: 700;
	}

	.body {
		margin: 0 0 var(--space-4);
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-2);
	}

	.err {
		color: var(--red);
		font-size: 13px;
		margin-bottom: var(--space-3);
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
	}

	.primary,
	.secondary {
		width: 100%;
		min-height: 48px;
		margin-top: var(--space-2);
		border-radius: var(--radius-sm);
		font-weight: 650;
		cursor: pointer;
	}

	.primary {
		border: 1px solid var(--red-line);
		background: rgba(255, 42, 42, 0.12);
		color: var(--red);
	}

	.secondary {
		border: 1px solid var(--line-2);
		background: transparent;
		color: var(--text-2);
	}

	.link {
		display: block;
		margin-top: var(--space-4);
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}

	.codes {
		margin: 0 0 var(--space-4);
		padding-left: var(--space-4);
		font-size: 12px;
		letter-spacing: 0.06em;
	}

	.lab {
		font-size: 9px;
		color: var(--text-3);
		margin-bottom: var(--space-2);
	}
</style>
