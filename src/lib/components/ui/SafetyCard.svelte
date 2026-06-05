<script lang="ts">
	interface Props {
		body?: string;
	}

	let {
		body = 'Health is a planning companion — not medical advice. Review major diet, supplement, medication, or training changes with a qualified professional.'
	}: Props = $props();
</script>

<aside class="safety health-card">
	<p class="safety__label">Safety</p>
	<p class="safety__body">{body}</p>
</aside>

<style>
	.safety {
		padding: var(--space-4);
		background: var(--health-surface-soft);
	}

	.safety__label {
		margin: 0 0 var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--health-amber);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.safety__body {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--health-muted);
	}
</style>
