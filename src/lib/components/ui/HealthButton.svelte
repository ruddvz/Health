<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'success';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		block?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit';
		href?: '/' | '/import';
		ariaLabel?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		block = false,
		disabled = false,
		type = 'button',
		href,
		ariaLabel,
		onclick,
		children
	}: Props = $props();
</script>

{#if href && !disabled}
	<a
		class="btn pressable"
		class:btn--primary={variant === 'primary'}
		class:btn--secondary={variant === 'secondary'}
		class:btn--soft={variant === 'soft'}
		class:btn--ghost={variant === 'ghost'}
		class:btn--danger={variant === 'danger'}
		class:btn--success={variant === 'success'}
		class:btn--sm={size === 'sm'}
		class:btn--lg={size === 'lg'}
		class:btn--block={block}
		href={resolve(href)}
		aria-label={ariaLabel}
	>
		{@render children()}
	</a>
{:else}
	<button
		class="btn pressable"
		class:btn--primary={variant === 'primary'}
		class:btn--secondary={variant === 'secondary'}
		class:btn--soft={variant === 'soft'}
		class:btn--ghost={variant === 'ghost'}
		class:btn--danger={variant === 'danger'}
		class:btn--success={variant === 'success'}
		class:btn--sm={size === 'sm'}
		class:btn--lg={size === 'lg'}
		class:btn--block={block}
		{type}
		{disabled}
		aria-label={ariaLabel}
		{onclick}
	>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		min-height: 48px;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 0 20px;
		font-size: var(--t-callout);
		font-weight: 760;
		letter-spacing: -0.01em;
		text-decoration: none;
		cursor: pointer;
		color: inherit;
		background: transparent;
	}

	.btn--sm {
		min-height: 46px;
		padding: 0 16px;
		font-size: var(--t-footnote);
	}

	.btn--lg {
		min-height: 56px;
		padding: 0 22px;
		font-size: var(--t-body);
	}

	.btn--block {
		width: 100%;
	}

	.btn--primary {
		border-color: rgba(167, 255, 106, 0.28);
		background: linear-gradient(180deg, rgba(167, 255, 106, 0.95), rgba(112, 242, 166, 0.86));
		color: #081008;
		box-shadow: 0 12px 28px rgba(112, 242, 166, 0.18);
	}

	html[data-theme='light'] .btn--primary {
		background: linear-gradient(180deg, #43c75f, #0fa968);
		color: #ffffff;
		box-shadow: 0 12px 28px rgba(67, 199, 95, 0.2);
	}

	.btn--secondary {
		background: rgba(255, 255, 255, 0.055);
		color: var(--h-text);
		border-color: var(--h-line-strong);
		font-weight: 650;
	}

	html[data-theme='light'] .btn--secondary {
		background: rgba(20, 32, 24, 0.04);
	}

	.btn--soft {
		background: var(--h-surface-2);
		color: var(--h-text);
		border-color: var(--h-line);
	}

	.btn--ghost {
		background: transparent;
		color: var(--h-text-muted);
		border-color: transparent;
	}

	.btn--danger {
		background: var(--h-red-soft);
		color: var(--h-red);
		border-color: var(--h-red-line);
	}

	.btn--success {
		background: var(--h-accent-soft);
		color: var(--h-accent);
		border-color: var(--h-accent-line);
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
