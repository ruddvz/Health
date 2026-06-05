import { isStandalonePwa } from '$lib/pwa/standalone';

export type PwaStatus = {
	standalone: boolean;
	serviceWorker: 'unsupported' | 'pending' | 'active' | 'none';
	version: string;
};

export type StorageEstimate = {
	usageLabel: string;
	quotaLabel: string;
	percent: number | null;
};

const APP_VERSION = '0.0.1';

export async function getPwaStatus(): Promise<PwaStatus> {
	const standalone = isStandalonePwa();
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
		return { standalone, serviceWorker: 'unsupported', version: APP_VERSION };
	}
	const reg = await navigator.serviceWorker.getRegistration();
	const sw = reg?.active ? 'active' : reg ? 'pending' : 'none';
	return { standalone, serviceWorker: sw, version: APP_VERSION };
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
	if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
	try {
		const { usage = 0, quota = 0 } = await navigator.storage.estimate();
		const usageLabel = formatBytes(usage);
		const quotaLabel = quota > 0 ? formatBytes(quota) : '—';
		const percent = quota > 0 ? Math.round((usage / quota) * 100) : null;
		return { usageLabel, quotaLabel, percent };
	} catch {
		return null;
	}
}

function formatBytes(n: number): string {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
