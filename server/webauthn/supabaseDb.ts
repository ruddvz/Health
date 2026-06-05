import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { getWebAuthnEnv } from './env.js';
import { memoryStore } from './memoryStore.js';

export interface DbUser {
	id: string;
	email: string | null;
	displayName: string;
}

export interface DbCredential {
	credentialId: string;
	userId: string;
	publicKey: string;
	counter: number;
	transports: string[];
	deviceName: string | null;
}

export interface DbAdapter {
	findUserByEmail(email: string): Promise<DbUser | null>;
	createUser(email: string | null, displayName: string): Promise<DbUser>;
	listCredentials(userId: string): Promise<DbCredential[]>;
	findCredential(credentialId: string): Promise<DbCredential | null>;
	saveCredential(input: {
		userId: string;
		credentialId: string;
		publicKey: string;
		counter: number;
		deviceName: string | null;
		transports: string[];
		backedUp?: boolean;
	}): Promise<void>;
	updateCounter(credentialId: string, counter: number): Promise<void>;
	saveChallenge(
		id: string,
		challenge: string,
		userId: string | null,
		type: string,
		ttlMs: number
	): Promise<void>;
	consumeChallenge(id: string): Promise<{
		challenge: string;
		userId: string | null;
		type: string;
	} | null>;
	createSession(userId: string, ttlMs: number): Promise<string>;
	sessionUser(token: string): Promise<string | null>;
	saveBackup(userId: string, ciphertext: string, iv: string, version: number): Promise<void>;
	getBackup(userId: string): Promise<{
		ciphertext: string;
		iv: string;
		version: number;
		updatedAt: string;
	} | null>;
}

function memoryAdapter(): DbAdapter {
	return {
		async findUserByEmail(email) {
			const u = memoryStore.findUserByEmail(email);
			return u ? { id: u.id, email: u.email, displayName: u.displayName } : null;
		},
		async createUser(email, displayName) {
			const u = memoryStore.createUser(email, displayName);
			return { id: u.id, email: u.email, displayName: u.displayName };
		},
		async listCredentials(userId) {
			return memoryStore.listCredentials(userId).map((c) => ({
				credentialId: c.credentialId,
				userId: c.userId,
				publicKey: c.publicKey,
				counter: c.counter,
				transports: c.transports,
				deviceName: c.deviceName
			}));
		},
		async findCredential(credentialId) {
			const c = memoryStore.findCredential(credentialId);
			if (!c) return null;
			return {
				credentialId: c.credentialId,
				userId: c.userId,
				publicKey: c.publicKey,
				counter: c.counter,
				transports: c.transports,
				deviceName: c.deviceName
			};
		},
		async saveCredential(input) {
			memoryStore.saveCredential({
				id: randomUUID(),
				userId: input.userId,
				credentialId: input.credentialId,
				publicKey: input.publicKey,
				counter: input.counter,
				deviceName: input.deviceName,
				transports: input.transports
			});
		},
		async updateCounter(credentialId, counter) {
			memoryStore.updateCounter(credentialId, counter);
		},
		async saveChallenge(id, challenge, userId, type, ttlMs) {
			memoryStore.saveChallenge(id, challenge, userId, type, ttlMs);
		},
		async consumeChallenge(id) {
			const c = memoryStore.consumeChallenge(id);
			if (!c) return null;
			return { challenge: c.challenge, userId: c.userId, type: c.type };
		},
		async createSession(userId, ttlMs) {
			return memoryStore.createSession(userId, ttlMs);
		},
		async sessionUser(token) {
			return memoryStore.sessionUser(token);
		},
		async saveBackup(userId, ciphertext, iv, version) {
			memoryStore.saveBackup(userId, ciphertext, iv);
			void version;
		},
		async getBackup(userId) {
			return memoryStore.getBackup(userId) ?? null;
		}
	};
}

function supabaseAdapter(client: SupabaseClient): DbAdapter {
	return {
		async findUserByEmail(email) {
			const { data } = await client
				.from('health_users')
				.select('id, email, display_name')
				.eq('email', email)
				.maybeSingle();
			if (!data) return null;
			return { id: data.id, email: data.email, displayName: data.display_name };
		},
		async createUser(email, displayName) {
			const { data, error } = await client
				.from('health_users')
				.insert({ email, display_name: displayName })
				.select('id, email, display_name')
				.single();
			if (error) throw error;
			return { id: data.id, email: data.email, displayName: data.display_name };
		},
		async listCredentials(userId) {
			const { data } = await client
				.from('passkey_credentials')
				.select('credential_id, user_id, public_key, counter, transports, device_name')
				.eq('user_id', userId);
			return (data ?? []).map((row) => ({
				credentialId: row.credential_id,
				userId: row.user_id,
				publicKey: row.public_key,
				counter: Number(row.counter),
				transports: row.transports ?? [],
				deviceName: row.device_name
			}));
		},
		async findCredential(credentialId) {
			const { data } = await client
				.from('passkey_credentials')
				.select('credential_id, user_id, public_key, counter, transports, device_name')
				.eq('credential_id', credentialId)
				.maybeSingle();
			if (!data) return null;
			return {
				credentialId: data.credential_id,
				userId: data.user_id,
				publicKey: data.public_key,
				counter: Number(data.counter),
				transports: data.transports ?? [],
				deviceName: data.device_name
			};
		},
		async saveCredential(input) {
			const { error } = await client.from('passkey_credentials').insert({
				user_id: input.userId,
				credential_id: input.credentialId,
				public_key: input.publicKey,
				counter: input.counter,
				device_name: input.deviceName,
				transports: input.transports
			});
			if (error) throw error;
		},
		async updateCounter(credentialId, counter) {
			await client
				.from('passkey_credentials')
				.update({ counter, last_used_at: new Date().toISOString() })
				.eq('credential_id', credentialId);
		},
		async saveChallenge(id, challenge, userId, type, ttlMs) {
			const expires = new Date(Date.now() + ttlMs).toISOString();
			await client.from('webauthn_challenges').insert({
				id,
				challenge,
				user_id: userId,
				type,
				expires_at: expires
			});
		},
		async consumeChallenge(id) {
			const { data } = await client
				.from('webauthn_challenges')
				.select('challenge, user_id, type, expires_at')
				.eq('id', id)
				.maybeSingle();
			if (!data) return null;
			await client.from('webauthn_challenges').delete().eq('id', id);
			if (new Date(data.expires_at).getTime() < Date.now()) return null;
			return { challenge: data.challenge, userId: data.user_id, type: data.type };
		},
		async createSession(userId, ttlMs) {
			const token = randomUUID();
			const expires = new Date(Date.now() + ttlMs).toISOString();
			await client.from('health_sessions').insert({
				token,
				user_id: userId,
				expires_at: expires
			});
			return token;
		},
		async sessionUser(token) {
			const { data } = await client
				.from('health_sessions')
				.select('user_id, expires_at')
				.eq('token', token)
				.maybeSingle();
			if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
			return data.user_id;
		},
		async saveBackup(userId, ciphertext, iv, version) {
			const { error } = await client.from('encrypted_health_plans').upsert({
				user_id: userId,
				ciphertext,
				iv,
				version,
				updated_at: new Date().toISOString()
			});
			if (error) throw error;
		},
		async getBackup(userId) {
			const { data } = await client
				.from('encrypted_health_plans')
				.select('ciphertext, iv, version, updated_at')
				.eq('user_id', userId)
				.maybeSingle();
			if (!data) return null;
			return {
				ciphertext: data.ciphertext,
				iv: data.iv,
				version: data.version,
				updatedAt: data.updated_at
			};
		}
	};
}

let dbSingleton: DbAdapter | null = null;

export async function getDb(): Promise<DbAdapter> {
	if (dbSingleton) return dbSingleton;
	const env = getWebAuthnEnv();
	if (env.productionMisconfigured) {
		throw new Error(
			'Cloud passkey backend is not configured for production. Set Supabase env vars or HEALTH_ALLOW_MEMORY_STORE=true for dev.'
		);
	}
	if (env.useMemoryStore) {
		dbSingleton = memoryAdapter();
		return dbSingleton;
	}
	const client = createClient(env.supabaseUrl!, env.supabaseServiceKey!, {
		auth: { persistSession: false }
	});
	dbSingleton = supabaseAdapter(client);
	return dbSingleton;
}
