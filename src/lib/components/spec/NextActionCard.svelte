<script lang="ts">
	import HealthButton from '$lib/components/ui/HealthButton.svelte';

	interface Props {
		eyebrow: string;
		title: string;
		subtitle: string;
		detail?: string;
		micro?: string;
		ctaLabel?: string;
		onclick?: () => void;
	}
	let { eyebrow, title, subtitle, detail, micro, ctaLabel = 'Open', onclick }: Props = $props();
</script>

<section class="hero-card next-action">
	<p class="pill">{eyebrow}</p>
	<h2 class="title">{title}</h2>
	<p class="subtitle">{subtitle}</p>
	{#if detail}
		<p class="detail">{detail}</p>
	{/if}
	{#if micro}
		<p class="micro">{micro}</p>
	{/if}
	{#if onclick}
		<div class="cta">
			<HealthButton variant="primary" size="lg" block {onclick}>{ctaLabel}</HealthButton>
		</div>
	{/if}
</section>

<style>
	.next-action {
		margin-bottom: var(--phone-card-gap);
	}

	.pill {
		display: inline-flex;
		margin: 0 0 var(--s-3);
		padding: 6px 12px;
		border-radius: var(--r-pill);
		border: 1px solid var(--h-accent-line);
		background: var(--h-accent-soft);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--h-accent);
	}

	.title {
		margin: 0 0 var(--s-2);
		font-size: clamp(28px, 7vw, 32px);
		font-weight: 760;
		line-height: var(--lh-title);
		letter-spacing: -0.03em;
		color: var(--h-text);
	}

	.subtitle {
		margin: 0;
		font-size: var(--t-callout);
		color: var(--h-text-soft);
		line-height: var(--lh-body);
	}

	.detail {
		margin: var(--s-3) 0 0;
		font-size: var(--t-title-3);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.micro {
		margin: var(--s-2) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.cta {
		margin-top: var(--s-5);
	}
</style>
