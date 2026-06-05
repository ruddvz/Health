import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { persistSettings, settings } from '$lib/stores/healthApp';

export type ThemeMode = 'dark' | 'light';

export function themeFromSettings(raw: Record<string, unknown>): ThemeMode {
	const t = raw.theme;
	return t === 'dark' ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode) {
	if (!browser) return;
	document.documentElement.dataset.theme = mode === 'light' ? 'light' : 'dark';
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.setAttribute('content', mode === 'light' ? '#f7f4ee' : '#11100e');
}

export function syncThemeFromSettings(raw?: Record<string, unknown>) {
	const s = raw ?? get(settings);
	applyTheme(themeFromSettings(s));
}

export function setTheme(mode: ThemeMode) {
	const cur = get(settings);
	persistSettings({ ...cur, theme: mode });
	applyTheme(mode);
}
