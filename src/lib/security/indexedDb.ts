import { browser } from '$app/environment';
import { IDB_SECURITY_DB, IDB_SECURITY_STORE } from '$lib/constants/storage';

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(IDB_SECURITY_DB, 1);
		req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
		req.onsuccess = () => resolve(req.result);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(IDB_SECURITY_STORE)) {
				db.createObjectStore(IDB_SECURITY_STORE);
			}
		};
	});
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
	if (!browser) return undefined;
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_SECURITY_STORE, 'readonly');
		const req = tx.objectStore(IDB_SECURITY_STORE).get(key);
		req.onsuccess = () => resolve(req.result as T | undefined);
		req.onerror = () => reject(req.error);
	});
}

export async function idbSet(key: string, value: unknown): Promise<void> {
	if (!browser) return;
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_SECURITY_STORE, 'readwrite');
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.objectStore(IDB_SECURITY_STORE).put(value, key);
	});
}

export async function idbDelete(key: string): Promise<void> {
	if (!browser) return;
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_SECURITY_STORE, 'readwrite');
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.objectStore(IDB_SECURITY_STORE).delete(key);
	});
}

export async function idbClearAll(): Promise<void> {
	if (!browser) return;
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(IDB_SECURITY_STORE, 'readwrite');
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.objectStore(IDB_SECURITY_STORE).clear();
	});
}

/** Optional: migrate large localStorage blobs into IndexedDB (future encrypted payloads). */
export async function migrateLocalStorageFlag(key: string): Promise<boolean> {
	if (!browser) return false;
	const flag = await idbGet<boolean>(`migrated:${key}`);
	return flag === true;
}

export async function markLocalStorageMigrated(key: string): Promise<void> {
	await idbSet(`migrated:${key}`, true);
}
