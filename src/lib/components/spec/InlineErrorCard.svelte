<script lang="ts">
	type Severity = 'info' | 'warning' | 'error' | 'success';

	interface Props {
		title: string;
		body: string;
		severity?: Severity;
	}
	let { title, body, severity = 'error' }: Props = $props();
</script>

<div class="card" data-severity={severity} role="alert" aria-live="polite">
	<p class="t">{title}</p>
	<pre class="b">{body}</pre>
</div>

<style>
	.card {
		margin: var(--s-3) 0;
		padding: var(--s-4);
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-red-line);
		background: var(--h-red-soft);
	}

	.card[data-severity='info'] {
		border-color: var(--h-blue-line);
		background: var(--h-blue-soft);
	}

	.card[data-severity='warning'] {
		border-color: var(--h-orange-line);
		background: var(--h-orange-soft);
	}

	.card[data-severity='success'] {
		border-color: var(--h-accent-line);
		background: var(--h-accent-soft);
	}

	.t {
		margin: 0 0 var(--s-2);
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-red);
	}

	.card[data-severity='info'] .t {
		color: var(--h-blue);
	}

	.card[data-severity='warning'] .t {
		color: var(--h-orange);
	}

	.card[data-severity='success'] .t {
		color: var(--h-accent);
	}

	.b {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font-mono);
		font-size: var(--t-caption);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}
</style>
