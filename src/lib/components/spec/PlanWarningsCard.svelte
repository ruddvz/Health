<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		warnings: string[];
	}
	let { warnings }: Props = $props();
</script>

{#if warnings.length}
	<section class="card" role="status" aria-live="polite">
		<p class="t">Plan checks</p>
		<ul>
			{#each warnings as w, i (i)}
				<li>{w}</li>
			{/each}
		</ul>
		<a class="link" href={resolve('/system/diagnostics')}>Open diagnostics</a>
	</section>
{/if}

<style>
	.card {
		padding: var(--s-4);
		margin-bottom: var(--s-3);
		border-radius: var(--r-card);
		border: 1px solid var(--h-orange-line);
		background: var(--h-orange-soft);
	}

	.t {
		margin: 0 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-orange);
	}

	ul {
		margin: 0 0 var(--s-3);
		padding-left: 1.1rem;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.link {
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		color: var(--h-orange);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
