<script lang="ts">
	import HealthButton from './HealthButton.svelte';

	interface Props {
		title: string;
		body: string;
		details?: string;
		onRetry?: () => void;
	}

	let { title, body, details, onRetry }: Props = $props();
	let showDetails = $state(false);
</script>

<section class="error health-card" role="alert">
	<h2 class="error__title">{title}</h2>
	<p class="error__body">{body}</p>
	<div class="error__actions">
		{#if onRetry}
			<HealthButton variant="primary" onclick={onRetry}>Try again</HealthButton>
		{/if}
		{#if details}
			<HealthButton variant="ghost" onclick={() => (showDetails = !showDetails)}>
				{showDetails ? 'Hide details' : 'Copy error details'}
			</HealthButton>
		{/if}
	</div>
	{#if showDetails && details}
		<pre class="error__details">{details}</pre>
	{/if}
</section>

<style>
	.error {
		border-color: color-mix(in srgb, var(--health-red) 30%, var(--health-line));
		background: var(--health-red-soft);
	}

	.error__title {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
		color: var(--health-red);
	}

	.error__body {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--health-ink-2);
		line-height: var(--leading-body);
	}

	.error__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	.error__details {
		margin: var(--space-3) 0 0;
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.06);
		font-size: var(--text-xs);
		overflow-x: auto;
		white-space: pre-wrap;
	}
</style>
