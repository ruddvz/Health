import { browser } from '$app/environment';
import type { ValidationIssue } from '$lib/validation/issues';

export function downloadDiagnosticsReport(issues: ValidationIssue[], parseWarnings: string[]) {
	if (!browser) return;
	const payload = {
		exportedAt: new Date().toISOString(),
		issues,
		parseWarnings
	};
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'health-diagnostics.json';
	a.click();
	URL.revokeObjectURL(a.href);
}
