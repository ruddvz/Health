import { randomUUID } from 'node:crypto';
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import { getWebAuthnEnv } from './env.js';
import { bearerToken, errorResponse, jsonResponse, readJson } from './http.js';
import { memoryStore } from './memoryStore.js';
import { getDb } from './supabaseDb.js';

const CHALLENGE_TTL_MS = 5 * 60_000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;

export async function handleRegisterOptions(request: Request): Promise<Response> {
	const env = getWebAuthnEnv();
	const body = await readJson<{ email?: string; displayName?: string }>(request);
	const email = body.email?.trim().toLowerCase() || null;
	const displayName = body.displayName?.trim() || email || 'Health user';

	const db = await getDb();
	let user = email ? await db.findUserByEmail(email) : null;
	if (!user) user = await db.createUser(email, displayName);

	const existing = await db.listCredentials(user.id);
	const options = await generateRegistrationOptions({
		rpName: env.rpName,
		rpID: env.rpID,
		userID: new Uint8Array(Buffer.from(user.id.replace(/-/g, ''), 'hex').slice(0, 32)),
		userName: email ?? user.id,
		userDisplayName: displayName,
		attestationType: 'none',
		excludeCredentials: existing.map((c) => ({
			id: c.credentialId,
			transports: c.transports as AuthenticatorTransport[]
		})),
		authenticatorSelection: {
			residentKey: 'preferred',
			userVerification: 'required',
			authenticatorAttachment: 'platform'
		}
	});

	const challengeId = randomUUID();
	await db.saveChallenge(challengeId, options.challenge, user.id, 'registration', CHALLENGE_TTL_MS);

	return jsonResponse({ ok: true, challengeId, userId: user.id, options });
}

export async function handleRegisterVerify(request: Request): Promise<Response> {
	const env = getWebAuthnEnv();
	const body = await readJson<{
		challengeId: string;
		userId: string;
		response: RegistrationResponseJSON;
		deviceName?: string;
	}>(request);

	const db = await getDb();
	const pending = await db.consumeChallenge(body.challengeId);
	if (!pending || pending.type !== 'registration' || pending.userId !== body.userId) {
		return errorResponse('Challenge expired or invalid.', 400);
	}

	const verification = await verifyRegistrationResponse({
		response: body.response,
		expectedChallenge: pending.challenge,
		expectedOrigin: env.origin,
		expectedRPID: env.rpID,
		requireUserVerification: true
	});

	if (!verification.verified || !verification.registrationInfo) {
		return errorResponse('Passkey registration could not be verified.', 400);
	}

	const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
	await db.saveCredential({
		userId: body.userId,
		credentialId: credential.id,
		publicKey: Buffer.from(credential.publicKey).toString('base64'),
		counter: credential.counter,
		deviceName: body.deviceName ?? credentialDeviceType,
		transports: credential.transports ?? [],
		backedUp: credentialBackedUp
	});

	const sessionToken = await db.createSession(body.userId, SESSION_TTL_MS);
	return jsonResponse({
		ok: true,
		verified: true,
		sessionToken,
		userId: body.userId,
		credentialId: credential.id
	});
}

export async function handleAuthenticateOptions(request: Request): Promise<Response> {
	const env = getWebAuthnEnv();
	const body = await readJson<{ email?: string }>(request).catch(() => ({}));
	const db = await getDb();

	let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] | undefined;
	if (body.email) {
		const user = await db.findUserByEmail(body.email.trim().toLowerCase());
		if (!user) return errorResponse('No account found for that email.', 404);
		const creds = await db.listCredentials(user.id);
		allowCredentials = creds.map((c) => ({
			id: c.credentialId,
			transports: c.transports as AuthenticatorTransport[]
		}));
	}

	const options = await generateAuthenticationOptions({
		rpID: env.rpID,
		userVerification: 'required',
		allowCredentials
	});

	const challengeId = randomUUID();
	await db.saveChallenge(challengeId, options.challenge, null, 'authentication', CHALLENGE_TTL_MS);

	return jsonResponse({ ok: true, challengeId, options });
}

export async function handleAuthenticateVerify(request: Request): Promise<Response> {
	const env = getWebAuthnEnv();
	const body = await readJson<{
		challengeId: string;
		response: AuthenticationResponseJSON;
	}>(request);

	const db = await getDb();
	const pending = await db.consumeChallenge(body.challengeId);
	if (!pending || pending.type !== 'authentication') {
		return errorResponse('Challenge expired or invalid.', 400);
	}

	const cred = await db.findCredential(body.response.id);
	if (!cred) return errorResponse('Unknown passkey.', 400);

	const verification = await verifyAuthenticationResponse({
		response: body.response,
		expectedChallenge: pending.challenge,
		expectedOrigin: env.origin,
		expectedRPID: env.rpID,
		requireUserVerification: true,
		credential: {
			id: cred.credentialId,
			publicKey: Buffer.from(cred.publicKey, 'base64'),
			counter: cred.counter,
			transports: cred.transports as AuthenticatorTransport[]
		}
	});

	if (!verification.verified) return errorResponse('Passkey authentication failed.', 401);

	await db.updateCounter(cred.credentialId, verification.authenticationInfo.newCounter);
	const sessionToken = await db.createSession(cred.userId, SESSION_TTL_MS);

	return jsonResponse({
		ok: true,
		verified: true,
		sessionToken,
		userId: cred.userId
	});
}

export async function handleBackupPut(request: Request): Promise<Response> {
	const token = bearerToken(request);
	if (!token) return errorResponse('Unauthorized', 401);
	const db = await getDb();
	const userId = await db.sessionUser(token);
	if (!userId) return errorResponse('Session expired', 401);

	const body = await readJson<{ ciphertext: string; iv: string; version?: number }>(request);
	if (!body.ciphertext || !body.iv) return errorResponse('Missing ciphertext or iv', 400);

	await db.saveBackup(userId, body.ciphertext, body.iv, body.version ?? 1);
	return jsonResponse({ ok: true, updatedAt: new Date().toISOString() });
}

export async function handleBackupGet(request: Request): Promise<Response> {
	const token = bearerToken(request);
	if (!token) return errorResponse('Unauthorized', 401);
	const db = await getDb();
	const userId = await db.sessionUser(token);
	if (!userId) return errorResponse('Session expired', 401);

	const backup = await db.getBackup(userId);
	if (!backup) return jsonResponse({ ok: true, backup: null });
	return jsonResponse({ ok: true, backup });
}

/** Dev-only: memory store stats */
export function handleHealth(): Response {
	const env = getWebAuthnEnv();
	return jsonResponse({
		ok: true,
		rpID: env.rpID,
		origin: env.origin,
		store: env.useMemoryStore ? 'memory' : 'supabase'
	});
}

export { memoryStore };
