<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'default' | 'green' | 'amber' | 'blue' | 'purple' | 'red';

	interface Props {
		tone?: Tone;
		children: Snippet;
	}

	let { tone = 'default', children }: Props = $props();
</script>

<span
	class="chip"
	class:chip--green={tone === 'green'}
	class:chip--amber={tone === 'amber'}
	class:chip--blue={tone === 'blue'}
	class:chip--purple={tone === 'purple'}
	class:chip--red={tone === 'red'}
>
	{@render children()}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 28px;
		padding: 0 10px;
		border-radius: var(--radius-pill);
		background: var(--health-surface-soft);
		border: 1px solid var(--health-line);
		color: var(--health-muted);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
	}

	.chip--green {
		background: var(--health-green-soft);
		color: var(--health-green);
		border-color: transparent;
	}

	.chip--amber {
		background: var(--health-amber-soft);
		color: var(--health-amber);
		border-color: transparent;
	}

	.chip--blue {
		background: var(--health-blue-soft);
		color: var(--health-blue);
		border-color: transparent;
	}

	.chip--purple {
		background: var(--health-purple-soft);
		color: var(--health-purple);
		border-color: transparent;
	}

	.chip--red {
		background: var(--health-red-soft);
		color: var(--health-red);
		border-color: transparent;
	}
</style>
