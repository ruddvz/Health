<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		warnings: string[];
	}
	let { warnings }: Props = $props();
</script>

{#if warnings.length}
	<section class="card nothing-surface" role="status" aria-live="polite">
		<p class="mono-caps t">Plan checks</p>
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
		padding: var(--space-4);
		margin-bottom: var(--space-3);
		border-color: rgba(255, 204, 77, 0.35);
		background: rgba(255, 204, 77, 0.08);
	}

	.t {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--warning);
	}

	ul {
		margin: 0 0 var(--space-3);
		padding-left: 1.1rem;
		font-size: 14px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.link {
		font-size: 13px;
		font-weight: 650;
		color: var(--warning);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
