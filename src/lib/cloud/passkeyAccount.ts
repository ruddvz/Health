import { browser } from '$app/environment';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON
} from '@simplewebauthn/browser';
import { cloudApiBaseUrl, isCloudApiConfigured } from '$lib/security/domainConfig';
import { clearCloudSession, saveCloudSession, type CloudSession } from '$lib/cloud/cloudSession';

function apiUrl(path: string): string {
	const base = cloudApiBaseUrl();
	if (!base) throw new Error('Set PUBLIC_HEALTH_API_URL to your Vercel API origin.');
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(apiUrl(path), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = (await res.json()) as T & { ok?: boolean; error?: string };
	if (!res.ok || data.ok === false) {
		throw new Error(data.error ?? `Request failed (${res.status})`);
	}
	return data;
}

export function isCloudPasskeyAvailable(): boolean {
	return browser && isCloudApiConfigured();
}

export async function registerCloudPasskey(opts: {
	email?: string;
	displayName?: string;
	deviceName?: string;
}): Promise<CloudSession> {
	const prep = await postJson<{
		challengeId: string;
		userId: string;
		options: PublicKeyCredentialCreationOptionsJSON;
	}>('/api/webauthn/register/options', {
		email: opts.email,
		displayName: opts.displayName
	});

	const response: RegistrationResponseJSON = await startRegistration({
		optionsJSON: prep.options
	});

	const verified = await postJson<{
		sessionToken: string;
		userId: string;
	}>('/api/webauthn/register/verify', {
		challengeId: prep.challengeId,
		userId: prep.userId,
		response,
		deviceName: opts.deviceName ?? 'This device'
	});

	const session: CloudSession = {
		sessionToken: verified.sessionToken,
		userId: verified.userId,
		email: opts.email,
		createdAt: new Date().toISOString()
	};
	saveCloudSession(session);
	return session;
}

export async function signInCloudPasskey(email?: string): Promise<CloudSession> {
	const prep = await postJson<{
		challengeId: string;
		options: PublicKeyCredentialRequestOptionsJSON;
	}>('/api/webauthn/authenticate/options', { email });

	const response: AuthenticationResponseJSON = await startAuthentication({
		optionsJSON: prep.options
	});

	const verified = await postJson<{
		sessionToken: string;
		userId: string;
	}>('/api/webauthn/authenticate/verify', {
		challengeId: prep.challengeId,
		response
	});

	const session: CloudSession = {
		sessionToken: verified.sessionToken,
		userId: verified.userId,
		email,
		createdAt: new Date().toISOString()
	};
	saveCloudSession(session);
	return session;
}

export function signOutCloud() {
	clearCloudSession();
}

export async function pingCloudApi(): Promise<{ ok: boolean; store?: string }> {
	if (!isCloudApiConfigured()) return { ok: false };
	const res = await fetch(apiUrl('/api/health/status'));
	const data = (await res.json()) as { ok?: boolean; store?: string };
	return { ok: !!data.ok, store: data.store };
}
