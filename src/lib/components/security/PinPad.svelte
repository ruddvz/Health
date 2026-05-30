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
		gap: var(--space-4);
	}

	.dots {
		display: flex;
		gap: 12px;
		min-height: 16px;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid var(--line-2);
		background: transparent;
	}

	.dot.filled {
		background: var(--red);
		border-color: var(--red);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		width: min(280px, 100%);
	}

	.key {
		min-height: 52px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-1);
		background: var(--surface-2);
		color: var(--text-1);
		font-size: 22px;
		font-weight: 600;
		cursor: pointer;
	}

	.key.spacer {
		visibility: hidden;
		pointer-events: none;
		border: none;
		background: transparent;
	}

	.key.del {
		font-size: 18px;
	}

	.key:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
