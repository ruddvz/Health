<script lang="ts">
	interface Props {
		title: string;
		subtitle: string;
		tag: string;
	}
	let { title, subtitle, tag }: Props = $props();
</script>

<div class="card nothing-surface">
	<div class="row">
		<div class="mid">
			<p class="t">{title}</p>
			<p class="s">{subtitle}</p>
		</div>
		<span class="tg">{tag}</span>
	</div>
</div>

<style>
	.card {
		padding: var(--s-3) var(--s-4);
		margin-bottom: var(--s-2);
		border: 1px solid var(--h-blue-line);
		background: linear-gradient(180deg, var(--h-blue-soft), var(--h-surface));
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-height: 64px;
	}

	.t {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.s {
		margin: var(--s-1) 0 0;
		font-size: var(--t-caption);
		color: var(--h-text-muted);
		line-height: var(--lh-caption);
	}

	.tg {
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-blue);
		border: 1px solid var(--h-blue-line);
		background: var(--h-blue-soft);
		padding: var(--s-1) var(--s-2);
		border-radius: var(--r-pill);
		flex-shrink: 0;
	}
</style>
