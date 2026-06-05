<script lang="ts">
	import { resolve } from '$app/paths';
	import { loadSamplePlan } from '$lib/logic/loadSamplePlan';

	interface Props {
		onStartIntake?: () => void;
	}

	let { onStartIntake }: Props = $props();

	let sampleBusy = $state(false);
	let sampleError = $state<string | null>(null);

	async function onSample() {
		if (
			!confirm(
				'Load the demo sample plan? It is labeled as a demo and stored only on this device. You can replace it anytime via Import.'
			)
		) {
			return;
		}
		sampleBusy = true;
		sampleError = null;
		try {
			await loadSamplePlan();
		} catch (e) {
			sampleError = e instanceof Error ? e.message : 'Could not load sample plan';
		} finally {
			sampleBusy = false;
		}
	}
</script>

<a class="btn-primary" href={resolve('/import')}>Import JSON</a>
{#if onStartIntake}
	<button type="button" class="btn-secondary pressable" onclick={onStartIntake}>
		Create plan prompt
	</button>
{:else}
	<a class="btn-secondary" href={resolve('/')}>Create plan prompt</a>
{/if}
<button
	type="button"
	class="btn-ghost pressable"
	disabled={sampleBusy}
	onclick={onSample}
	aria-busy={sampleBusy}
>
	{sampleBusy ? 'Loading sample…' : 'Load sample plan (demo)'}
</button>
{#if sampleError}
	<p class="err" role="alert">{sampleError}</p>
{/if}

<style>
	.err {
		margin: var(--space-2) 0 0;
		font-size: 13px;
		color: var(--danger, var(--red));
		line-height: 1.4;
	}
</style>
