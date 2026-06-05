<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		subtitle?: string;
		value?: string;
		chevron?: boolean;
		icon?: Snippet;
		onclick?: () => void;
	}
	let { label, subtitle, value, chevron = true, icon, onclick }: Props = $props();
</script>

<button type="button" class="row pressable" {onclick}>
	<span class="icon-tile" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				<rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.6" />
			</svg>
		{/if}
	</span>
	<span class="copy">
		<span class="lab">{label}</span>
		{#if subtitle}
			<span class="sub">{subtitle}</span>
		{/if}
	</span>
	{#if value}
		<span class="value">{value}</span>
	{/if}
	{#if chevron}
		<span class="chev" aria-hidden="true">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path
					d="M9 6l6 6-6 6"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	{/if}
</button>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		width: 100%;
		min-height: 64px;
		padding: 12px;
		border: none;
		background: transparent;
		color: var(--h-text);
		cursor: pointer;
		text-align: left;
	}

	.icon-tile {
		width: 42px;
		height: 42px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--h-surface-2);
		border: 1px solid var(--h-line);
		color: var(--h-text-muted);
		flex-shrink: 0;
	}

	.copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.lab {
		font-size: var(--t-callout);
		font-weight: 650;
		color: var(--h-text);
	}

	.sub {
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-caption);
	}

	.value {
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		flex-shrink: 0;
	}

	.chev {
		color: var(--h-text-faint);
		flex-shrink: 0;
	}
</style>
