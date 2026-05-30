<script lang="ts">
	import { browser } from '$app/environment';
	import { uploadEncryptedBackup, downloadEncryptedBackup } from '$lib/cloud/cloudBackup';
	import {
		isCloudPasskeyAvailable,
		pingCloudApi,
		registerCloudPasskey,
		signInCloudPasskey,
		signOutCloud
	} from '$lib/cloud/passkeyAccount';
	import { loadCloudSession } from '$lib/cloud/cloudSession';
	import { getPasskeyServerCapability } from '$lib/security/passkeyServer';
	import { getRelyingPartyInfo } from '$lib/security/rpOrigin';
	import { encryptJson } from '$lib/security/vault';
	import { plan, progress, onboarding, settings } from '$lib/stores/healthApp';
	import { get } from 'svelte/store';

	const cap = getPasskeyServerCapability();
	const rp = browser ? getRelyingPartyInfo() : null;

	let email = $state('');
	let displayName = $state('');
	let cloudPassword = $state('');
	let busy = $state(false);
	let error = $state<string | null>(null);
	let status = $state<string | null>(null);
	let session = $state(loadCloudSession());
	let apiStore = $state<string | null>(null);

	$effect(() => {
		if (!browser || !cap.available) return;
		void pingCloudApi().then((r) => {
			apiStore = r.store ?? null;
		});
	});

	async function register() {
		busy = true;
		error = null;
		status = null;
		try {
			session = await registerCloudPasskey({
				email: email.trim() || undefined,
				displayName: displayName.trim() || undefined
			});
			status = 'Cloud passkey registered. You can upload an encrypted backup.';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Registration failed';
		} finally {
			busy = false;
		}
	}

	async function signIn() {
		busy = true;
		error = null;
		try {
			session = await signInCloudPasskey(email.trim() || undefined);
			status = 'Signed in with cloud passkey.';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Sign-in failed';
		} finally {
			busy = false;
		}
	}

	function signOut() {
		signOutCloud();
		session = null;
		status = 'Signed out of cloud account.';
	}

	async function uploadBackup() {
		if (!cloudPassword.trim()) {
			error = 'Enter a cloud backup password (encrypts before upload).';
			return;
		}
		busy = true;
		error = null;
		try {
			const payload = {
				plan: get(plan),
				progress: get(progress),
				onboarding: get(onboarding),
				settings: get(settings),
				exportedAt: new Date().toISOString()
			};
			const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
				'encrypt',
				'decrypt'
			]);
			const wrapKey = await deriveKeyFromPassword(cloudPassword);
			const exported = await crypto.subtle.exportKey('raw', dek);
			const ivWrap = crypto.getRandomValues(new Uint8Array(12));
			const wrappedDek = await crypto.subtle.wrapKey('raw', dek, wrapKey, {
				name: 'AES-GCM',
				iv: ivWrap
			});
			const encrypted = await encryptJson(dek, payload);
			const bundle = {
				wrappedDek: btoa(String.fromCharCode(...new Uint8Array(wrappedDek))),
				ivWrap: btoa(String.fromCharCode(...new Uint8Array(ivWrap))),
				...encrypted
			};
			await uploadEncryptedBackup(JSON.stringify(bundle), bundle.ivB64);
			status = 'Encrypted backup uploaded. Health servers never see your password.';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			busy = false;
		}
	}

	async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
		const salt = new TextEncoder().encode('health-cloud-backup-v1');
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			'PBKDF2',
			false,
			['deriveKey']
		);
		return crypto.subtle.deriveKey(
			{ name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['wrapKey', 'unwrapKey']
		);
	}

	async function downloadBackup() {
		if (!cloudPassword.trim()) {
			error = 'Enter the same cloud backup password used at upload.';
			return;
		}
		busy = true;
		error = null;
		try {
			const remote = await downloadEncryptedBackup();
			if (!remote) {
				status = 'No cloud backup found for this account.';
				return;
			}
			const bundle = JSON.parse(remote.ciphertext) as {
				wrappedDek: string;
				ivWrap: string;
				ivB64: string;
				cipherB64: string;
			};
			const wrapKey = await deriveKeyFromPassword(cloudPassword);
			const rawDek = await crypto.subtle.unwrapKey(
				'raw',
				Uint8Array.from(atob(bundle.wrappedDek), (c) => c.charCodeAt(0)),
				wrapKey,
				{
					name: 'AES-GCM',
					iv: Uint8Array.from(atob(bundle.ivWrap), (c) => c.charCodeAt(0))
				},
				{ name: 'AES-GCM', length: 256 },
				false,
				['decrypt']
			);
			const { decryptJson } = await import('$lib/security/vault');
			const payload = await decryptJson<Record<string, unknown>>(rawDek, bundle);
			status = `Backup from ${String(payload.exportedAt ?? 'cloud')} — import plan manually from exported JSON if needed.`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Download failed';
		} finally {
			busy = false;
		}
	}
</script>

<section class="block nothing-surface">
	<h2 class="mono-caps h">Phase 3 — Cloud passkey account</h2>
	{#if cap.available}
		<p class="p">
			Server-verified passkeys via <code>{cap.apiUrl}</code>
			{#if apiStore}
				(store: {apiStore}){/if}
		</p>
		{#if rp}
			<p class="mono-caps sub">RP ID: {rp.rpId} · Origin: {rp.origin}</p>
		{/if}
		{#if session}
			<p class="p">Signed in · user {session.userId.slice(0, 8)}…</p>
			<button type="button" class="btn secondary pressable" disabled={busy} onclick={signOut}
				>Sign out</button
			>
		{:else}
			<label class="field">
				<span class="mono-caps">Email (optional)</span>
				<input class="inp" type="email" bind:value={email} disabled={busy} />
			</label>
			<label class="field">
				<span class="mono-caps">Display name</span>
				<input class="inp" bind:value={displayName} disabled={busy} />
			</label>
			<button
				type="button"
				class="btn pressable"
				disabled={busy || !isCloudPasskeyAvailable()}
				onclick={register}
			>
				Create cloud passkey
			</button>
			<button type="button" class="btn secondary pressable" disabled={busy} onclick={signIn}>
				Sign in with passkey
			</button>
		{/if}
		<label class="field">
			<span class="mono-caps">Cloud backup password</span>
			<input class="inp" type="password" bind:value={cloudPassword} disabled={busy} />
		</label>
		<button type="button" class="btn pressable" disabled={busy || !session} onclick={uploadBackup}>
			Upload encrypted backup
		</button>
		<button
			type="button"
			class="btn secondary pressable"
			disabled={busy || !session}
			onclick={downloadBackup}
		>
			Download encrypted backup
		</button>
	{:else}
		<p class="p">{cap.reason}</p>
		<p class="p muted">
			Set <code>PUBLIC_HEALTH_API_URL</code> in Vercel, deploy this repo with
			<code>vercel.json</code>, and run the Supabase migration.
		</p>
	{/if}
	{#if status}<p class="status">{status}</p>{/if}
	{#if error}<p class="err" role="alert">{error}</p>{/if}
</section>

<style>
	.block {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
		border: 1px solid var(--line-1);
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
	.status {
		margin-top: var(--space-3);
		font-size: 14px;
		color: var(--text-2);
	}
	.err {
		color: var(--red);
		font-size: 13px;
	}
	code {
		font-size: 12px;
	}
</style>
