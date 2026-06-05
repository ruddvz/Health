<script lang="ts">
	import { loadSamplePlan } from '$lib/logic/loadSamplePlan';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';

	interface Props {
		onStartIntake?: () => void;
	}

	let { onStartIntake }: Props = $props();

	let sampleBusy = $state(false);
	let sampleError = $state<string | null>(null);

	async function onSample() {
		if (!confirm('Load the demo plan? It stays on this device.')) return;
		sampleBusy = true;
		sampleError = null;
		try {
			await loadSamplePlan();
		} catch (e) {
			sampleError = e instanceof Error ? e.message : 'Could not load demo plan';
		} finally {
			sampleBusy = false;
		}
	}
</script>

<HealthButton variant="primary" block disabled={sampleBusy} onclick={onSample}>
	{sampleBusy ? 'Loading demo…' : 'Load demo plan'}
</HealthButton>
<HealthButton variant="secondary" block href="/import">Import plan</HealthButton>
{#if onStartIntake}
	<HealthButton variant="ghost" block onclick={onStartIntake}>Create plan prompt</HealthButton>
{:else}
	<HealthButton variant="ghost" block href="/">Create plan prompt</HealthButton>
{/if}
{#if sampleError}
	<p class="err" role="alert">{sampleError}</p>
{/if}

<style>
	.err {
		margin: var(--space-2) 0 0;
		font-size: var(--text-sm);
		color: var(--health-red);
		line-height: var(--leading-body);
	}
</style>
