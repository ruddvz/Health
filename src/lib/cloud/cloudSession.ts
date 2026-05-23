import { browser } from '$app/environment';

const LS_CLOUD_SESSION = 'health.cloud.session';

export interface CloudSession {
	sessionToken: string;
	userId: string;
	email?: string;
	createdAt: string;
}

export function loadCloudSession(): CloudSession | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(LS_CLOUD_SESSION);
		if (!raw) return null;
		return JSON.parse(raw) as CloudSession;
	} catch {
		return null;
	}
}

export function saveCloudSession(session: CloudSession) {
	if (!browser) return;
	localStorage.setItem(LS_CLOUD_SESSION, JSON.stringify(session));
}

export function clearCloudSession() {
	if (!browser) return;
	localStorage.removeItem(LS_CLOUD_SESSION);
}
