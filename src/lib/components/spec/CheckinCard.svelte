<script lang="ts">
	interface Props {
		title: string;
		question: string;
		subtitle: string;
		cta: string;
		onclick?: () => void;
	}
	let { title, question, subtitle, cta, onclick }: Props = $props();
</script>

<section class="card nothing-surface">
	<p class="t">{title}</p>
	<p class="q">{question}</p>
	<p class="s">{subtitle}</p>
	<button type="button" class="btn pressable" {onclick}>{cta}</button>
</section>

<style>
	.card {
		padding: var(--s-4);
		margin-bottom: var(--s-3);
	}

	.t {
		margin: 0;
		color: var(--h-text-faint);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
	}

	.q {
		margin: var(--s-2) 0 0;
		font-size: var(--t-body-lg);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
		line-height: var(--lh-title);
	}

	.s {
		margin: var(--s-2) 0 var(--s-4);
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-body);
	}

	.btn {
		width: 100%;
		min-height: 48px;
		border-radius: var(--r-pill);
		border: none;
		background: var(--h-accent);
		color: var(--health-primary-text);
		font-weight: var(--weight-semibold);
		font-size: var(--t-footnote);
		cursor: pointer;
		box-shadow: var(--shadow-glow);
	}
</style>
