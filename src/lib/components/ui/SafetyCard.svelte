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
		padding: var(--s-4);
		background: var(--h-orange-soft);
		border-color: var(--h-orange-line);
	}

	.safety__label {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-orange);
	}

	.safety__body {
		margin: 0;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}
</style>
