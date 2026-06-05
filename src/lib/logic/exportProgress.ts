import { browser } from '$app/environment';
import type { ProgressV2 } from '$lib/types/planV2';

export function downloadProgressJson(data: ProgressV2, filename = 'health-progress.json') {
	if (!browser) return;
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}
