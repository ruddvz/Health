import { randomUUID } from 'node:crypto';

export interface MemoryUser {
	id: string;
	email: string | null;
	displayName: string;
}

export interface MemoryCredential {
	id: string;
	userId: string;
	credentialId: string;
	publicKey: string;
	counter: number;
	deviceName: string | null;
	transports: string[];
}

const users = new Map<string, MemoryUser>();
const usersByEmail = new Map<string, string>();
const credentials = new Map<string, MemoryCredential>();
const challenges = new Map<string, { challenge: string; userId: string | null; type: string; expires: number }>();
const sessions = new Map<string, { userId: string; expires: number }>();
const backups = new Map<string, { ciphertext: string; iv: string; version: number; updatedAt: string }>();

export const memoryStore = {
	createUser(email: string | null, displayName: string): MemoryUser {
		const id = randomUUID();
		const user: MemoryUser = { id, email, displayName };
		users.set(id, user);
		if (email) usersByEmail.set(email.toLowerCase(), id);
		return user;
	},
	findUserByEmail(email: string): MemoryUser | undefined {
		const id = usersByEmail.get(email.toLowerCase());
		return id ? users.get(id) : undefined;
	},
	findUserById(id: string): MemoryUser | undefined {
		return users.get(id);
	},
	saveChallenge(id: string, challenge: string, userId: string | null, type: string, ttlMs: number) {
		challenges.set(id, { challenge, userId, type, expires: Date.now() + ttlMs });
	},
	consumeChallenge(id: string) {
		const c = challenges.get(id);
		challenges.delete(id);
		if (!c || c.expires < Date.now()) return null;
		return c;
	},
	saveCredential(c: MemoryCredential) {
		credentials.set(c.credentialId, c);
	},
	listCredentials(userId: string): MemoryCredential[] {
		return [...credentials.values()].filter((c) => c.userId === userId);
	},
	findCredential(credentialId: string): MemoryCredential | undefined {
		return credentials.get(credentialId);
	},
	updateCounter(credentialId: string, counter: number) {
		const c = credentials.get(credentialId);
		if (c) c.counter = counter;
	},
	createSession(userId: string, ttlMs: number): string {
		const token = randomUUID();
		sessions.set(token, { userId, expires: Date.now() + ttlMs });
		return token;
	},
	sessionUser(token: string): string | null {
		const s = sessions.get(token);
		if (!s || s.expires < Date.now()) {
			sessions.delete(token);
			return null;
		}
		return s.userId;
	},
	saveBackup(userId: string, ciphertext: string, iv: string) {
		backups.set(userId, {
			ciphertext,
			iv,
			version: 1,
			updatedAt: new Date().toISOString()
		});
	},
	getBackup(userId: string) {
		return backups.get(userId);
	}
};
