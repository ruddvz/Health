<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import AppHeader from '$lib/components/app/AppHeader.svelte';
	import { onboarding, persistOnboarding, plan } from '$lib/stores/healthApp';
	import type { Snippet } from 'svelte';
	import { get } from 'svelte/store';

	interface Props {
		title: string;
		subtitle?: string;
		pageLabel?: string;
		emptyTitle: string;
		emptyBody: string;
		children: Snippet;
	}

	let { title, subtitle, pageLabel, emptyTitle, emptyBody, children }: Props = $props();

	function startIntake() {
		persistOnboarding({ ...get(onboarding), intakeLaunched: true });
		goto(resolve('/'));
	}
</script>

{#if $plan}
	{@render children()}
{:else}
	<main class="screen stack">
		<AppHeader {title} {subtitle} pageLabel={pageLabel ?? title} planState="none" />
		<EmptyState title={emptyTitle} body={emptyBody}>
			<NoPlanActions onStartIntake={startIntake} />
		</EmptyState>
	</main>
{/if}

<style>
	.screen {
		flex: 1;
	}
</style>
