import { get } from 'svelte/store';
import { LS_GROCERY } from '$lib/constants/storage';
import { defaultOnboardingState, normalizeOnboarding } from '$lib/logic/onboardingState';
import type { VaultSnapshot } from '$lib/security/vault';
import { persistVaultSlice } from '$lib/security/vault';
import { parsePlanJsonText } from '$lib/validation/planV2';
import type { ProgressV2 } from '$lib/types/planV2';
import {
	activeDayType,
	importWarnings,
	onboarding,
	plan,
	progress,
	settings
} from '$lib/stores/healthApp';

/** Apply decrypted vault snapshot into in-memory stores (does not write localStorage). */
export function hydrateFromVaultSnapshot(snap: VaultSnapshot) {
	if (snap.plan) {
		const r = parsePlanJsonText(snap.plan);
		if (r.ok) {
			plan.set(r.plan);
			importWarnings.set(r.warnings);
		} else {
			plan.set(null);
			importWarnings.set([r.error]);
		}
	} else {
		plan.set(null);
	}

	if (snap.progress) {
		try {
			progress.set(JSON.parse(snap.progress) as ProgressV2);
		} catch {
			progress.set({});
		}
	}
	if (snap.onboarding) {
		try {
			onboarding.set(normalizeOnboarding(JSON.parse(snap.onboarding)));
		} catch {
			onboarding.set(defaultOnboardingState());
		}
	}
	if (snap.settings) {
		try {
			settings.set(JSON.parse(snap.settings) as Record<string, unknown>);
		} catch {
			settings.set({});
		}
	}
	if (snap.activeDayType === 'workout' || snap.activeDayType === 'rest') {
		activeDayType.set(snap.activeDayType);
	}
}

export async function persistAllToVault(dek: CryptoKey) {
	const p = get(plan);
	if (p) await persistVaultSlice(dek, 'plan', p);
	await persistVaultSlice(dek, 'progress', get(progress));
	await persistVaultSlice(dek, 'onboarding', get(onboarding));
	await persistVaultSlice(dek, 'settings', get(settings));
	const dt = get(activeDayType);
	await persistVaultSlice(dek, 'activeDayType', dt);
	const g = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_GROCERY) : null;
	if (g) {
		try {
			await persistVaultSlice(dek, 'grocery', JSON.parse(g));
		} catch {
			/* ignore */
		}
	}
}

export function vaultSnapshotFromStores(): VaultSnapshot {
	return {
		plan: get(plan) ? JSON.stringify(get(plan)) : null,
		progress: JSON.stringify(get(progress)),
		onboarding: JSON.stringify(get(onboarding)),
		settings: JSON.stringify(get(settings)),
		grocery: typeof localStorage !== 'undefined' ? localStorage.getItem(LS_GROCERY) : null,
		activeDayType: get(activeDayType)
	};
}
