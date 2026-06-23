import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import {
	LS_ACTIVE_DAY_TYPE,
	LS_GROCERY,
	LS_ONBOARDING,
	LS_PLAN,
	LS_PROGRESS,
	LS_SECURITY,
	LS_SETTINGS
} from '$lib/constants/storage';
import { defaultOnboardingState, normalizeOnboarding } from '$lib/logic/onboardingState';
import { loadSecurityConfig } from '$lib/security/config';
import { isVaultEncrypted } from '$lib/security/vault';
import type { DayType, OnboardingState, PlanV2, ProgressV2 } from '$lib/types/planV2';
import { parsePlanJsonText } from '$lib/validation/planV2';

export const plan = writable<PlanV2 | null>(null);
/** Set when persisted plan JSON exists but fails validation/parse. */
export const planParseError = writable<string | null>(null);
export const importWarnings = writable<string[]>([]);
export const activeDayType = writable<DayType>('workout');
export const progress = writable<ProgressV2>({});
export const settings = writable<Record<string, unknown>>({});
export const onboarding = writable<OnboardingState>(defaultOnboardingState());

function readJson<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function writeJson(key: string, value: unknown) {
	if (!browser) return;
	localStorage.setItem(key, JSON.stringify(value));
}

async function shouldSkipPlaintextHydrate(): Promise<boolean> {
	if (!browser) return false;
	const cfg = loadSecurityConfig();
	if (!cfg.encryptionEnabled) return false;
	return isVaultEncrypted();
}

/** Hydrate all persisted slices (call once from root layout onMount). */
export async function hydrateFromLocalStorage() {
	if (!browser) return;

	if (await shouldSkipPlaintextHydrate()) {
		const { hasVaultDek } = await import('$lib/stores/healthLock');
		if (!hasVaultDek()) {
			plan.set(null);
			importWarnings.set([]);
			progress.set({});
			settings.set({});
			onboarding.set(defaultOnboardingState());
			activeDayType.set('workout');
		}
		return;
	}

	const rawPlan = localStorage.getItem(LS_PLAN);
	if (rawPlan) {
		const r = parsePlanJsonText(rawPlan);
		if (r.ok) {
			plan.set(r.plan);
			importWarnings.set(r.warnings);
			planParseError.set(null);
		} else {
			plan.set(null);
			planParseError.set(r.error);
			importWarnings.set([r.error]);
		}
	} else {
		plan.set(null);
		planParseError.set(null);
	}

	const dt = localStorage.getItem(LS_ACTIVE_DAY_TYPE);
	if (dt === 'workout' || dt === 'rest') activeDayType.set(dt);
	else activeDayType.set('workout');

	progress.set(readJson<ProgressV2>(LS_PROGRESS, {}));
	settings.set(readJson<Record<string, unknown>>(LS_SETTINGS, {}));
	let obRaw: unknown = null;
	try {
		const s = localStorage.getItem(LS_ONBOARDING);
		if (s) obRaw = JSON.parse(s);
	} catch {
		obRaw = null;
	}
	onboarding.set(normalizeOnboarding(obRaw));
}

export { hydrateFromVaultSnapshot } from '$lib/stores/vaultBridge';

const PERSIST_DEBOUNCE_MS = 280;
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedPersistSlice(
	key: 'plan' | 'progress' | 'onboarding' | 'settings' | 'activeDayType',
	value: unknown
) {
	const prev = persistTimers.get(key);
	if (prev) clearTimeout(prev);
	persistTimers.set(
		key,
		setTimeout(() => {
			persistTimers.delete(key);
			void persistSlice(key, value);
		}, PERSIST_DEBOUNCE_MS)
	);
}

export function persistOnboarding(state: OnboardingState) {
	onboarding.set(state);
	debouncedPersistSlice('onboarding', state);
}

export function persistActiveDayType(dt: DayType) {
	activeDayType.set(dt);
	debouncedPersistSlice('activeDayType', dt);
}

export function persistProgress(p: ProgressV2) {
	progress.set(p);
	debouncedPersistSlice('progress', p);
}

export function persistSettings(s: Record<string, unknown>) {
	settings.set(s);
	debouncedPersistSlice('settings', s);
}

export function savePlan(p: PlanV2, warnings: string[]) {
	plan.set(p);
	planParseError.set(null);
	importWarnings.set(warnings);
	void persistSlice('plan', p);
}

async function persistSlice(
	key: 'plan' | 'progress' | 'onboarding' | 'settings' | 'activeDayType',
	value: unknown
) {
	if (!browser) return;
	const cfg = loadSecurityConfig();
	const { hasVaultDek, getVaultDek } = await import('$lib/stores/healthLock');
	if (cfg.encryptionEnabled) {
		const dek = hasVaultDek() ? getVaultDek() : null;
		if (dek) {
			const { persistVaultSlice } = await import('$lib/security/vault');
			await persistVaultSlice(dek, key, value);
		}
		// Encryption is on but the vault is locked (no DEK): never fall back to
		// writing plaintext to localStorage, which would defeat the vault.
		return;
	}
	const lsMap = {
		plan: LS_PLAN,
		progress: LS_PROGRESS,
		onboarding: LS_ONBOARDING,
		settings: LS_SETTINGS,
		activeDayType: LS_ACTIVE_DAY_TYPE
	} as const;
	if (key === 'activeDayType') {
		localStorage.setItem(LS_ACTIVE_DAY_TYPE, String(value));
	} else {
		writeJson(lsMap[key], value);
	}
}

export function clearPlanParseError() {
	planParseError.set(null);
}

export function clearAllLocalHealthData() {
	if (!browser) return;
	for (const k of [
		LS_PLAN,
		LS_PROGRESS,
		LS_GROCERY,
		LS_SETTINGS,
		LS_ACTIVE_DAY_TYPE,
		LS_ONBOARDING,
		LS_SECURITY
	]) {
		localStorage.removeItem(k);
	}
	plan.set(null);
	planParseError.set(null);
	importWarnings.set([]);
	activeDayType.set('workout');
	progress.set({});
	settings.set({});
	onboarding.set(defaultOnboardingState());
	void import('$lib/stores/healthLock').then((m) => m.clearAllSecurityData());
}

export function getPlan(): PlanV2 | null {
	return get(plan);
}
