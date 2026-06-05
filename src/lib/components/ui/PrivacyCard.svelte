<script lang="ts">
	interface Props {
		title?: string;
		items?: string[];
	}

	let {
		title = 'Private by default',
		items = ['No account required', 'Works offline after install', 'Optional Health Lock']
	}: Props = $props();
</script>

<section class="privacy health-card">
	<h2 class="privacy__title">{title}</h2>
	<ul class="privacy__list">
		{#each items as item, i (i)}
			<li>{item}</li>
		{/each}
	</ul>
</section>

<style>
	.privacy__title {
		margin: 0 0 var(--space-3);
		font-size: var(--text-md);
		font-weight: var(--weight-bold);
		color: var(--health-ink);
	}

	.privacy__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.privacy__list li {
		position: relative;
		padding-left: 22px;
		font-size: var(--text-sm);
		color: var(--health-muted);
		line-height: var(--leading-body);
	}

	.privacy__list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.45em;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--health-green);
	}
</style>
