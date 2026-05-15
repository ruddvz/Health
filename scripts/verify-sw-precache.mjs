/**
 * Ensures the production service worker precaches the app shell and key routes.
 * Run after `npm run build` (expects `build/sw.js`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const swPath = join(root, 'build', 'sw.js');

if (!existsSync(swPath)) {
	console.error('verify-sw-precache: missing build/sw.js — run `npm run build` first.');
	process.exit(1);
}

const sw = readFileSync(swPath, 'utf8');

const urls = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
if (urls.length < 40) {
	console.error(`verify-sw-precache: precache looks too small (${urls.length} urls).`);
	process.exit(1);
}

const required = ['/Health/', '404.html', 'today', 'import', 'meals', '_app/immutable/entry/app'];
const missing = required.filter((r) => !urls.some((u) => u === r || u.includes(r)));
if (missing.length) {
	console.error('verify-sw-precache: missing precache entries:', missing.join(', '));
	process.exit(1);
}

if (!sw.includes('createHandlerBoundToURL("404.html")')) {
	console.error('verify-sw-precache: navigation fallback must use 404.html app shell.');
	process.exit(1);
}

if (sw.includes('createHandlerBoundToURL("offline.html")')) {
	console.error('verify-sw-precache: offline.html must not be the navigation fallback.');
	process.exit(1);
}

console.log(`verify-sw-precache: OK (${urls.length} precached URLs).`);
