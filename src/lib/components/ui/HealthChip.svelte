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
		gap: var(--s-2);
		min-height: 32px;
		padding: 0 var(--s-3);
		border-radius: var(--r-pill);
		background: var(--h-surface-2);
		border: 1px solid var(--h-line);
		color: var(--h-text-muted);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
	}

	.chip--green {
		background: var(--h-accent-soft);
		color: var(--h-accent);
		border-color: var(--h-accent-line);
	}

	.chip--amber {
		background: var(--h-orange-soft);
		color: var(--h-orange);
		border-color: var(--h-orange-line);
	}

	.chip--blue {
		background: var(--h-blue-soft);
		color: var(--h-blue);
		border-color: var(--h-blue-line);
	}

	.chip--purple {
		background: var(--health-purple-soft);
		color: var(--health-purple);
		border-color: transparent;
	}

	.chip--red {
		background: var(--h-red-soft);
		color: var(--h-red);
		border-color: var(--h-red-line);
	}
</style>
