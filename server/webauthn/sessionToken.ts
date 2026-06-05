import { createHash, randomUUID } from 'node:crypto';

/** Plain token returned to the client once; only a hash is stored server-side. */
export function issueSessionToken(): string {
	return randomUUID();
}

export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token, 'utf8').digest('hex');
}
