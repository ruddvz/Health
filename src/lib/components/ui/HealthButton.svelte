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
		href?: `/${string}`;
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
		min-height: 46px;
		border-radius: var(--radius-pill);
		border: 1px solid transparent;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 0 18px;
		font-size: var(--text-base);
		font-weight: var(--weight-bold);
		text-decoration: none;
		cursor: pointer;
		color: inherit;
		background: transparent;
	}

	.btn--sm {
		min-height: 38px;
		padding: 0 14px;
		font-size: var(--text-sm);
	}

	.btn--lg {
		min-height: 52px;
		padding: 0 22px;
		font-size: var(--text-md);
	}

	.btn--block {
		width: 100%;
	}

	.btn--primary {
		background: var(--health-primary);
		color: var(--health-primary-text);
		box-shadow: 0 12px 24px rgba(20, 17, 15, 0.16);
	}

	.btn--secondary {
		background: var(--health-secondary);
		color: var(--health-secondary-text);
		border-color: var(--health-line-strong);
	}

	.btn--soft {
		background: var(--health-surface-soft);
		color: var(--health-ink);
		border-color: var(--health-line);
	}

	.btn--ghost {
		background: transparent;
		color: var(--health-muted);
		border-color: transparent;
	}

	.btn--danger {
		background: var(--health-red-soft);
		color: var(--health-red);
	}

	.btn--success {
		background: var(--health-green-soft);
		color: var(--health-green);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
