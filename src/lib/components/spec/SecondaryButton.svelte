<script lang="ts">
	interface Props {
		label: string;
		onclick?: () => void;
	}
	let { label, onclick }: Props = $props();
</script>

<button type="button" class="btn pressable" {onclick}>{label}</button>

<style>
	.btn {
		width: 100%;
		min-height: 48px;
		margin-bottom: var(--s-2);
		border-radius: var(--r-pill);
		border: 1px solid var(--h-line-strong);
		background: rgba(255, 255, 255, 0.055);
		color: var(--h-text);
		font-size: var(--t-callout);
		font-weight: 650;
		cursor: pointer;
	}
</style>
