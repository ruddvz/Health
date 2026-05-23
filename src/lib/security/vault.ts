import { browser } from '$app/environment';
import {
	LS_ACTIVE_DAY_TYPE,
	LS_GROCERY,
	LS_ONBOARDING,
	LS_PLAN,
	LS_PROGRESS,
	LS_SETTINGS
} from '$lib/constants/storage';
import { idbDelete, idbGet, idbSet } from '$lib/security/indexedDb';
import type { PinCredential } from '$lib/security/types';

const VAULT_WRAPPED_DEK = 'vault:wrappedDek';
const VAULT_PLAN = 'vault:plan';
const VAULT_PROGRESS = 'vault:progress';
const VAULT_ONBOARDING = 'vault:onboarding';
const VAULT_SETTINGS = 'vault:settings';
const VAULT_GROCERY = 'vault:grocery';
const VAULT_ACTIVE_DAY = 'vault:activeDayType';
const VAULT_META = 'vault:meta';

export interface VaultPayload {
	ivB64: string;
	cipherB64: string;
}

export interface WrappedDekPayload {
	saltB64: string;
	ivB64: string;
	wrappedB64: string;
}

function fromB64(s: string): Uint8Array {
	const bin = atob(s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

function toB64(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function deriveWrapKey(pin: string, saltB64: string): Promise<CryptoKey> {
	const salt = new Uint8Array(fromB64(saltB64));
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(pin),
		'PBKDF2',
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: 210_000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['wrapKey', 'unwrapKey']
	);
}

async function generateDek(): Promise<CryptoKey> {
	return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
		'encrypt',
		'decrypt'
	]);
}

export async function wrapDekForPin(dek: CryptoKey, pin: string, pinCred: PinCredential): Promise<WrappedDekPayload> {
	const wrapKey = await deriveWrapKey(pin, pinCred.saltB64);
	const ivBuf = crypto.getRandomValues(new Uint8Array(12));
	const iv = new Uint8Array(ivBuf);
	const wrapped = await crypto.subtle.wrapKey('raw', dek, wrapKey, { name: 'AES-GCM', iv });
	return {
		saltB64: pinCred.saltB64,
		ivB64: toB64(iv.buffer),
		wrappedB64: toB64(wrapped)
	};
}

export async function unwrapDekForPin(
	pin: string,
	wrapped: WrappedDekPayload
): Promise<CryptoKey> {
	const wrapKey = await deriveWrapKey(pin, wrapped.saltB64);
	const iv = new Uint8Array(fromB64(wrapped.ivB64));
	const wrappedKey = new Uint8Array(fromB64(wrapped.wrappedB64));
	const raw = await crypto.subtle.unwrapKey(
		'raw',
		wrappedKey,
		wrapKey,
		{ name: 'AES-GCM', iv },
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
	return raw;
}

export async function encryptJson(dek: CryptoKey, value: unknown): Promise<VaultPayload> {
	const ivBuf = crypto.getRandomValues(new Uint8Array(12));
	const iv = new Uint8Array(ivBuf);
	const plain = new TextEncoder().encode(JSON.stringify(value));
	const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dek, plain);
	return { ivB64: toB64(iv.buffer), cipherB64: toB64(cipher) };
}

export async function decryptJson<T>(dek: CryptoKey, payload: VaultPayload): Promise<T> {
	const iv = new Uint8Array(fromB64(payload.ivB64));
	const cipher = new Uint8Array(fromB64(payload.cipherB64));
	const plain = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		dek,
		cipher
	);
	return JSON.parse(new TextDecoder().decode(plain)) as T;
}

export async function isVaultEncrypted(): Promise<boolean> {
	if (!browser) return false;
	const meta = await idbGet<{ v: 1 }>(VAULT_META);
	return meta?.v === 1;
}

export async function migratePlaintextToVault(
	pin: string,
	pinCred: PinCredential
): Promise<CryptoKey> {
	if (!browser) throw new Error('Vault requires a browser');
	const dek = await generateDek();
	const wrapped = await wrapDekForPin(dek, pin, pinCred);
	await idbSet(VAULT_WRAPPED_DEK, wrapped);
	await idbSet(VAULT_META, { v: 1 });

	const snapshot = {
		plan: localStorage.getItem(LS_PLAN),
		progress: localStorage.getItem(LS_PROGRESS),
		onboarding: localStorage.getItem(LS_ONBOARDING),
		settings: localStorage.getItem(LS_SETTINGS),
		grocery: localStorage.getItem(LS_GROCERY),
		activeDayType: localStorage.getItem(LS_ACTIVE_DAY_TYPE)
	};

	if (snapshot.plan) {
		await idbSet(VAULT_PLAN, await encryptJson(dek, JSON.parse(snapshot.plan)));
		localStorage.removeItem(LS_PLAN);
	}
	if (snapshot.progress) {
		await idbSet(VAULT_PROGRESS, await encryptJson(dek, JSON.parse(snapshot.progress)));
		localStorage.removeItem(LS_PROGRESS);
	}
	if (snapshot.onboarding) {
		await idbSet(VAULT_ONBOARDING, await encryptJson(dek, JSON.parse(snapshot.onboarding)));
		localStorage.removeItem(LS_ONBOARDING);
	}
	if (snapshot.settings) {
		await idbSet(VAULT_SETTINGS, await encryptJson(dek, JSON.parse(snapshot.settings)));
		localStorage.removeItem(LS_SETTINGS);
	}
	if (snapshot.grocery) {
		await idbSet(VAULT_GROCERY, await encryptJson(dek, JSON.parse(snapshot.grocery)));
		localStorage.removeItem(LS_GROCERY);
	}
	if (snapshot.activeDayType) {
		await idbSet(VAULT_ACTIVE_DAY, await encryptJson(dek, snapshot.activeDayType));
		localStorage.removeItem(LS_ACTIVE_DAY_TYPE);
	}

	return dek;
}

export async function loadWrappedDek(): Promise<WrappedDekPayload | undefined> {
	return idbGet<WrappedDekPayload>(VAULT_WRAPPED_DEK);
}

export async function clearVaultRecords(): Promise<void> {
	for (const k of [
		VAULT_WRAPPED_DEK,
		VAULT_PLAN,
		VAULT_PROGRESS,
		VAULT_ONBOARDING,
		VAULT_SETTINGS,
		VAULT_GROCERY,
		VAULT_ACTIVE_DAY,
		VAULT_META
	]) {
		await idbDelete(k);
	}
}

export type VaultSnapshot = {
	plan: string | null;
	progress: string | null;
	onboarding: string | null;
	settings: string | null;
	grocery: string | null;
	activeDayType: string | null;
};

export async function exportVaultSnapshot(dek: CryptoKey): Promise<VaultSnapshot> {
	const out: VaultSnapshot = {
		plan: null,
		progress: null,
		onboarding: null,
		settings: null,
		grocery: null,
		activeDayType: null
	};
	const planP = await idbGet<VaultPayload>(VAULT_PLAN);
	if (planP) out.plan = JSON.stringify(await decryptJson(dek, planP));
	const progP = await idbGet<VaultPayload>(VAULT_PROGRESS);
	if (progP) out.progress = JSON.stringify(await decryptJson(dek, progP));
	const obP = await idbGet<VaultPayload>(VAULT_ONBOARDING);
	if (obP) out.onboarding = JSON.stringify(await decryptJson(dek, obP));
	const setP = await idbGet<VaultPayload>(VAULT_SETTINGS);
	if (setP) out.settings = JSON.stringify(await decryptJson(dek, setP));
	const groP = await idbGet<VaultPayload>(VAULT_GROCERY);
	if (groP) out.grocery = JSON.stringify(await decryptJson(dek, groP));
	const dayP = await idbGet<VaultPayload>(VAULT_ACTIVE_DAY);
	if (dayP) out.activeDayType = await decryptJson<string>(dek, dayP);
	return out;
}

export async function persistVaultSlice(
	dek: CryptoKey,
	key: 'plan' | 'progress' | 'onboarding' | 'settings' | 'grocery' | 'activeDayType',
	value: unknown
): Promise<void> {
	const map = {
		plan: VAULT_PLAN,
		progress: VAULT_PROGRESS,
		onboarding: VAULT_ONBOARDING,
		settings: VAULT_SETTINGS,
		grocery: VAULT_GROCERY,
		activeDayType: VAULT_ACTIVE_DAY
	} as const;
	await idbSet(map[key], await encryptJson(dek, value));
}
