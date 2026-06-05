<script lang="ts">
	interface Props {
		title: string;
		tag: string;
		duration: string;
		description: string;
	}
	let { title, tag, duration, description }: Props = $props();
</script>

<section class="hero health-hero-card">
	<div class="top">
		<p class="tag">{tag}</p>
		<p class="dur">{duration}</p>
	</div>
	<h2 class="title">{title}</h2>
	<p class="desc">{description}</p>
</section>

<style>
	.hero {
		padding: var(--s-5);
		margin-bottom: var(--s-3);
		min-height: 172px;
		position: relative;
		overflow: hidden;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--s-3);
		position: relative;
		z-index: 1;
	}

	.tag,
	.dur {
		margin: 0;
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.title {
		margin: 0;
		position: relative;
		z-index: 1;
		font-size: var(--t-title-2);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		line-height: var(--lh-title);
		color: var(--h-text);
	}

	.desc {
		margin: var(--s-3) 0 0;
		position: relative;
		z-index: 1;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-muted);
	}
</style>
