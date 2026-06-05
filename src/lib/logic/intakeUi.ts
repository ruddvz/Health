import type { IntakeErrors } from '$lib/logic/onboardingValidation';

export function intakeErrDomId(errorKey: string): string {
	return `intake-err-${errorKey.replace(/\./g, '-')}`;
}

export function errDescribedBy(fieldErrors: IntakeErrors, key: string): string | undefined {
	return fieldErrors[key] ? intakeErrDomId(key) : undefined;
}

export function intakeErrorSummary(fieldErrors: IntakeErrors): string {
	return Object.entries(fieldErrors)
		.filter(([, m]) => m)
		.map(([k, m]) => `${k}: ${m}`)
		.join('\n');
}
