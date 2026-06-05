<script lang="ts">
	interface Props {
		value?: string;
		maxLength?: number;
		disabled?: boolean;
		oncomplete?: (pin: string) => void;
	}
	let { value = $bindable(''), maxLength = 6, disabled = false, oncomplete }: Props = $props();

	function press(d: string) {
		if (disabled || value.length >= maxLength) return;
		value += d;
		if (value.length === maxLength) oncomplete?.(value);
	}

	function backspace() {
		if (disabled) return;
		value = value.slice(0, -1);
	}
</script>

<div class="pad" role="group" aria-label="PIN keypad">
	<div class="dots" aria-live="polite">
		{#each Array.from({ length: maxLength }, (_, i) => i) as i (i)}
			<span class="dot" class:filled={i < value.length}></span>
		{/each}
	</div>
	<div class="grid">
		{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as d (d)}
			<button type="button" class="key pressable" {disabled} onclick={() => press(d)}>{d}</button>
		{/each}
		<span class="key spacer"></span>
		<button type="button" class="key pressable" {disabled} onclick={() => press('0')}>0</button>
		<button
			type="button"
			class="key pressable del"
			{disabled}
			onclick={backspace}
			aria-label="Delete">⌫</button
		>
	</div>
</div>

<style>
	.pad {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-4);
	}

	.dots {
		display: flex;
		gap: var(--s-3);
		min-height: 16px;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid var(--h-line-strong);
		background: transparent;
	}

	.dot.filled {
		background: var(--h-accent);
		border-color: var(--h-accent);
		box-shadow: 0 0 8px var(--h-accent-line);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--phone-card-gap);
		width: min(280px, 100%);
	}

	.key {
		min-height: 52px;
		border-radius: var(--r-card-inner);
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
		color: var(--h-text);
		font-size: var(--t-title-2);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}

	.key.spacer {
		visibility: hidden;
		pointer-events: none;
		border: none;
		background: transparent;
	}

	.key.del {
		font-size: var(--t-title-3);
	}

	.key:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
