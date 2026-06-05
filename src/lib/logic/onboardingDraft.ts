import type { OnboardingState } from '$lib/types/planV2';

/** True when the user has started intake beyond a blank first step. */
export function hasOnboardingDraft(o: OnboardingState): boolean {
	if (o.intakeLaunched) return true;
	if (o.step > 1) return true;
	if (o.confirmed) return true;
	if (o.profile.name.trim()) return true;
	if (o.goal.primary_goal) return true;
	if (o.diet.preference.trim() || o.diet.allergies.trim()) return true;
	return false;
}
