import { cloudApiBaseUrl } from '$lib/security/domainConfig';
import { loadCloudSession } from '$lib/cloud/cloudSession';

function apiUrl(path: string): string {
	const base = cloudApiBaseUrl();
	if (!base) throw new Error('Cloud API is not configured.');
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function uploadEncryptedBackup(ciphertext: string, iv: string): Promise<void> {
	const session = loadCloudSession();
	if (!session) throw new Error('Sign in with a cloud passkey first.');

	const res = await fetch(apiUrl('/api/health/backup'), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.sessionToken}`
		},
		body: JSON.stringify({ ciphertext, iv, version: 1 })
	});
	const body = (await res.json()) as { ok?: boolean; error?: string };
	if (!res.ok || !body.ok) throw new Error(body.error ?? 'Backup upload failed.');
}

export async function downloadEncryptedBackup(): Promise<{
	ciphertext: string;
	iv: string;
	version: number;
	updatedAt: string;
} | null> {
	const session = loadCloudSession();
	if (!session) throw new Error('Sign in with a cloud passkey first.');

	const res = await fetch(apiUrl('/api/health/backup'), {
		headers: { Authorization: `Bearer ${session.sessionToken}` }
	});
	const body = (await res.json()) as {
		ok?: boolean;
		error?: string;
		backup?: { ciphertext: string; iv: string; version: number; updatedAt: string } | null;
	};
	if (!res.ok || !body.ok) throw new Error(body.error ?? 'Backup download failed.');
	if (!body.backup) return null;
	return body.backup;
}
