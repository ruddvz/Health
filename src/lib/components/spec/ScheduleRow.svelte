<script lang="ts">
	interface Props {
		time: string;
		title: string;
		subtitle: string;
		checked: boolean;
		onToggle?: () => void;
	}
	let { time, title, subtitle, checked, onToggle }: Props = $props();
</script>

<div class="row nothing-surface-2">
	<span class="tm">{time}</span>
	<div class="mid">
		<p class="t">{title}</p>
		<p class="s">{subtitle}</p>
	</div>
	<label class="tog">
		<input type="checkbox" class="cb" {checked} onchange={() => onToggle?.()} />
	</label>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-height: 56px;
		padding: var(--s-2) var(--s-3);
		margin-bottom: var(--s-2);
	}

	.tm {
		width: 48px;
		flex-shrink: 0;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.mid {
		flex: 1;
		min-width: 0;
	}

	.t {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.s {
		margin: var(--s-1) 0 0;
		font-size: var(--t-caption);
		color: var(--h-text-muted);
	}

	.tog {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		flex-shrink: 0;
		cursor: pointer;
	}

	.cb {
		width: 22px;
		height: 22px;
		accent-color: var(--h-accent);
		cursor: pointer;
	}
</style>
