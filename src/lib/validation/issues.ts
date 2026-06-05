export type ValidationLevel = 'error' | 'warning' | 'info';

export type ValidationIssue = {
	level: ValidationLevel;
	code: string;
	path: string;
	message: string;
	fixHint?: string;
};

export function issue(
	level: ValidationLevel,
	code: string,
	path: string,
	message: string,
	fixHint?: string
): ValidationIssue {
	return { level, code, path, message, fixHint };
}

export function errorIssue(
	code: string,
	path: string,
	message: string,
	fixHint?: string
): ValidationIssue {
	return issue('error', code, path, message, fixHint);
}

export function warningIssue(
	code: string,
	path: string,
	message: string,
	fixHint?: string
): ValidationIssue {
	return issue('warning', code, path, message, fixHint);
}

export function infoIssue(
	code: string,
	path: string,
	message: string,
	fixHint?: string
): ValidationIssue {
	return issue('info', code, path, message, fixHint);
}

export function issuesToMessages(issues: ValidationIssue[]): string[] {
	return issues.map((i) => i.message);
}

export function firstErrorMessage(issues: ValidationIssue[]): string | null {
	return issues.find((i) => i.level === 'error')?.message ?? null;
}

export function warningMessages(issues: ValidationIssue[]): string[] {
	return issues.filter((i) => i.level === 'warning').map((i) => i.message);
}
