<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		variant?: 'primary' | 'destructive';
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}
	let {
		label,
		type = 'button',
		disabled = false,
		variant = 'primary',
		onclick,
		children
	}: Props = $props();
</script>

<button
	class="btn pressable"
	class:btn--destructive={variant === 'destructive'}
	{type}
	{disabled}
	{onclick}
>
	<span class="label">{label}</span>
	{#if children}
		<span class="slot">{@render children()}</span>
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		width: 100%;
		min-height: 54px;
		padding: 0 20px;
		border-radius: var(--r-pill);
		border: 1px solid rgba(167, 255, 106, 0.28);
		background: linear-gradient(180deg, rgba(167, 255, 106, 0.95), rgba(112, 242, 166, 0.86));
		color: #081008;
		font-family: var(--font-ui);
		font-size: var(--t-callout);
		font-weight: 760;
		letter-spacing: -0.01em;
		cursor: pointer;
		box-shadow: 0 12px 28px rgba(112, 242, 166, 0.18);
	}

	.btn--destructive {
		background: var(--h-red-soft);
		border-color: var(--h-red-line);
		color: var(--h-red);
		box-shadow: var(--shadow-danger);
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}

	.label {
		pointer-events: none;
	}

	.slot {
		font-size: 14px;
		line-height: 1;
		opacity: 0.85;
	}
</style>
