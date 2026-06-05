<script lang="ts">
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import NoPlanActions from '$lib/components/app/NoPlanActions.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		body: string;
		eyebrow?: string;
		onStartIntake?: () => void;
		preview?: Snippet;
	}

	let { title, body, eyebrow = 'Setup', onStartIntake, preview }: Props = $props();
</script>

<EmptyState {title} {body} {eyebrow} {preview}>
	<NoPlanActions {onStartIntake} />
	<p class="privacy">
		Your plan stays on this device unless you turn on Health Lock encryption or optional cloud
		backup later.
	</p>
</EmptyState>

<style>
	.privacy {
		margin: var(--space-3) 0 0;
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-3);
	}
</style>
