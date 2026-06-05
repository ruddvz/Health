import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { base, resolve } from '$app/paths';
import { flattenGrocery } from '$lib/logic/planDerive';
import type { PlanV2 } from '$lib/types/planV2';
import { persistProgress, progress, savePlan } from '$lib/stores/healthApp';
import { parsePlanJsonText } from '$lib/validation/planV2';
import { get } from 'svelte/store';

const SAMPLE_URL = `${base}/samples/rudra-plan-v2.json`;

function mergeGroceryChecked(planObj: PlanV2) {
	const items = flattenGrocery(planObj);
	const cur = get(progress);
	const next = { ...(cur.groceryChecked ?? {}) };
	for (const it of items) {
		if (!(it.key in next)) next[it.key] = false;
	}
	persistProgress({ ...cur, groceryChecked: next });
}

/** Fetch bundled sample JSON, validate, persist, and navigate to Today. */
export async function loadSamplePlan(): Promise<void> {
	if (!browser) return;
	const res = await fetch(SAMPLE_URL);
	if (!res.ok) throw new Error(`Sample plan not found (${res.status})`);
	const text = await res.text();
	const r = parsePlanJsonText(text);
	if (!r.ok) throw new Error(r.error);
	savePlan(r.plan, [
		...r.warnings,
		'Loaded demo sample plan — replace with your own JSON when ready.'
	]);
	mergeGroceryChecked(r.plan);
	await goto(resolve('/today'));
}
