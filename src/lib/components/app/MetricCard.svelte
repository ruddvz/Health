<script lang="ts">
	interface Props {
		label: string;
		value: string;
		sub?: string;
	}

	let { label, value, sub }: Props = $props();
</script>

<div class="card nothing-surface">
	<p class="mono-caps lab">{label}</p>
	<p class="val">{value}</p>
	{#if sub}
		<p class="sub">{sub}</p>
	{/if}
</div>

<style>
	.card {
		padding: var(--space-3) var(--space-4);
		min-height: 88px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.lab {
		margin: 0;
		font-size: 9px;
		color: var(--text-3);
	}

	.val {
		margin: 0;
		font-size: 22px;
		font-weight: 650;
		color: var(--text-1);
		letter-spacing: -0.02em;
	}

	.sub {
		margin: 0;
		font-size: 12px;
		color: var(--text-2);
		line-height: 1.4;
	}
</style>
