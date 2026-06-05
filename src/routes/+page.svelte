<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import WelcomeLauncher from '$lib/components/app/WelcomeLauncher.svelte';
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte';
	import type { OnboardingState } from '$lib/types/planV2';
	import { onboarding, persistOnboarding, plan } from '$lib/stores/healthApp';

	const showIntake = $derived($onboarding.intakeLaunched);

	function patch(p: Partial<OnboardingState>) {
		persistOnboarding({ ...$onboarding, ...p });
	}

	function launchIntake() {
		patch({ intakeLaunched: true });
	}

	function continueDraft() {
		patch({ intakeLaunched: true });
	}

	let redirected = false;
	$effect(() => {
		if (!browser || redirected) return;
		if ($plan) {
			redirected = true;
			goto(resolve('/today'));
		}
	});
</script>

{#if !showIntake}
	<WelcomeLauncher
		onboarding={$onboarding}
		onStartIntake={launchIntake}
		onContinueDraft={continueDraft}
	/>
{:else}
	<OnboardingFlow />
{/if}
